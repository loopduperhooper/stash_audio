import json
import os
import sys

import log
from stash_interface import StashInterface

TAG_NAME = "Funscript"


def main():
    input = readJSONInput()

    output = {}
    try:
        run(input, output)
    except Exception as e:
        output["error"] = str(e)

    out = json.dumps(output)
    print(out + "\n")


def readJSONInput():
    raw = sys.stdin.read()
    return json.loads(raw)


def run(input, output):
    client = StashInterface(input["server_connection"])

    hookContext = input["args"].get("hookContext")
    mode = input["args"].get("mode")

    if hookContext is not None:
        tagAudioIfFunscriptPresent(client, hookContext["id"])
    elif mode == "backfill":
        backfill(client)
    else:
        raise Exception("no hookContext or recognised mode provided")

    output["output"] = "ok"


def hasFunscriptSidecar(audio):
    for f in audio["files"]:
        base, _ = os.path.splitext(f["path"])
        if os.path.isfile(base + ".funscript"):
            return True
    return False


def tagAudioIfFunscriptPresent(client, audio_id):
    audio = client.findAudio(audio_id)
    if audio is None:
        log.LogWarning("Audio {} not found".format(audio_id))
        return

    applyTag(client, audio)


def applyTag(client, audio):
    """Tags audio with TAG_NAME if it has a funscript sidecar and isn't
    already tagged. Returns True if the tag was newly applied."""
    if not hasFunscriptSidecar(audio):
        return False

    existing_tag_ids = [t["id"] for t in audio["tags"]]

    tag_id = client.findTagIdWithName(TAG_NAME)
    if tag_id is None:
        tag_id = client.createTagWithName(TAG_NAME)

    if tag_id in existing_tag_ids:
        return False

    log.LogInfo("Tagging audio {} with {}".format(audio["id"], TAG_NAME))
    client.setAudioTagIds(audio["id"], existing_tag_ids + [tag_id])
    return True


def backfill(client):
    audios = client.findAllAudios()
    total = len(audios)
    tagged = 0

    for i, audio in enumerate(audios):
        if applyTag(client, audio):
            tagged += 1
        log.LogProgress(float(i + 1) / float(total) if total else 1)

    log.LogInfo("Tagged {} of {} audios".format(tagged, total))


main()
