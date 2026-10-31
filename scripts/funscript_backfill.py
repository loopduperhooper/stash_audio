#!/usr/bin/env python3
"""
Standalone backfill tool for the Funscript Auto-Tagger.

Does the same thing as the "Tag existing library" task in
plugins/funscript_autotag, but runs outside Stash as a plain script -
useful if the plugin isn't loading, or you just want to tag the library
without going through the UI/plugin system at all.

Usage:
    STASH_API_KEY=xxx python3 scripts/funscript_backfill.py
    python3 scripts/funscript_backfill.py --url http://localhost:9999 --api-key xxx
    python3 scripts/funscript_backfill.py --dry-run

An API key is only required if the server has authentication enabled
(Settings > Security > API Key in Stash). Generate one there if needed.
"""

import argparse
import os
import sys

import requests

TAG_NAME = "Funscript"


class StashClient:
    def __init__(self, url, api_key):
        self.url = url.rstrip("/") + "/graphql"
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if api_key:
            self.headers["ApiKey"] = api_key

    def call(self, query, variables=None):
        payload = {"query": query}
        if variables is not None:
            payload["variables"] = variables

        response = requests.post(self.url, json=payload, headers=self.headers)
        response.raise_for_status()

        result = response.json()
        if result.get("errors"):
            raise RuntimeError(f"GraphQL errors: {result['errors']}")
        return result["data"]

    def find_tag_id_with_name(self, name):
        query = """
query FindTags($filter: TagFilterType!) {
  findTags(tag_filter: $filter) {
    tags { id name }
  }
}
"""
        variables = {"filter": {"name": {"value": name, "modifier": "EQUALS"}}}
        tags = self.call(query, variables)["findTags"]["tags"]
        return tags[0]["id"] if tags else None

    def create_tag_with_name(self, name):
        query = """
mutation TagCreate($input: TagCreateInput!) {
  tagCreate(input: $input) { id }
}
"""
        variables = {"input": {"name": name}}
        return self.call(query, variables)["tagCreate"]["id"]

    def find_all_audios(self):
        query = """
query FindAudios($filter: FindFilterType!) {
  findAudios(filter: $filter) {
    count
    audios {
      id
      tags { id }
      files { path }
    }
  }
}
"""
        variables = {"filter": {"per_page": -1}}
        return self.call(query, variables)["findAudios"]["audios"]

    def set_audio_tag_ids(self, audio_id, tag_ids):
        query = """
mutation AudioUpdate($input: AudioUpdateInput!) {
  audioUpdate(input: $input) { id }
}
"""
        variables = {"input": {"id": audio_id, "tag_ids": tag_ids}}
        self.call(query, variables)


def has_funscript_sidecar(audio):
    for f in audio["files"]:
        base, _ = os.path.splitext(f["path"])
        if os.path.isfile(base + ".funscript"):
            return True
    return False


def backfill(client, dry_run):
    audios = client.find_all_audios()
    total = len(audios)
    tagged = 0
    skipped_no_sidecar = 0
    already_tagged = 0

    tag_id = client.find_tag_id_with_name(TAG_NAME)
    if tag_id is None and not dry_run:
        tag_id = client.create_tag_with_name(TAG_NAME)

    for audio in audios:
        if not has_funscript_sidecar(audio):
            skipped_no_sidecar += 1
            continue

        existing_tag_ids = [t["id"] for t in audio["tags"]]
        if tag_id is not None and tag_id in existing_tag_ids:
            already_tagged += 1
            continue

        path = audio["files"][0]["path"] if audio["files"] else "<no file>"
        if dry_run:
            print(f"[dry-run] would tag: {path}")
        else:
            client.set_audio_tag_ids(audio["id"], existing_tag_ids + [tag_id])
            print(f"tagged: {path}")
        tagged += 1

    print()
    print(f"total audios:        {total}")
    print(f"no funscript sidecar: {skipped_no_sidecar}")
    print(f"already tagged:       {already_tagged}")
    print(f"{'would tag' if dry_run else 'tagged'}:             {tagged}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--url",
        default=os.environ.get("STASH_URL", "http://localhost:9999"),
        help="Stash server URL (default: %(default)s, or $STASH_URL)",
    )
    parser.add_argument(
        "--api-key",
        default=os.environ.get("STASH_API_KEY"),
        help="Stash API key (default: $STASH_API_KEY)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List what would be tagged without making changes",
    )
    args = parser.parse_args()

    client = StashClient(args.url, args.api_key)
    try:
        backfill(client, args.dry_run)
    except requests.exceptions.RequestException as e:
        print(f"error: could not reach Stash at {args.url}: {e}", file=sys.stderr)
        sys.exit(1)
    except RuntimeError as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
