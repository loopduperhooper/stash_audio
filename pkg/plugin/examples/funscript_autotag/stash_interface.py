import requests


class StashInterface:
    def __init__(self, conn):
        self.port = conn["Port"]
        scheme = conn["Scheme"]

        self.url = scheme + "://localhost:" + str(self.port) + "/graphql"
        self.headers = {
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Connection": "keep-alive",
            "DNT": "1",
        }
        self.cookies = {"session": conn.get("SessionCookie").get("Value")}

    def __callGraphQL(self, query, variables=None):
        json = {"query": query}
        if variables is not None:
            json["variables"] = variables

        response = requests.post(
            self.url, json=json, headers=self.headers, cookies=self.cookies
        )

        if response.status_code == 200:
            result = response.json()
            if result.get("errors"):
                raise Exception("GraphQL errors: {}".format(result["errors"]))
            return result.get("data")

        raise Exception(
            "GraphQL query failed: {} - {}. Query: {}. Variables: {}".format(
                response.status_code, response.content, query, variables
            )
        )

    def findTagIdWithName(self, name):
        query = """
query FindTags($filter: TagFilterType!) {
  findTags(tag_filter: $filter) {
    tags {
      id
      name
    }
  }
}
"""
        variables = {"filter": {"name": {"value": name, "modifier": "EQUALS"}}}
        result = self.__callGraphQL(query, variables)
        tags = result["findTags"]["tags"]
        return tags[0]["id"] if tags else None

    def createTagWithName(self, name):
        query = """
mutation TagCreate($input: TagCreateInput!) {
  tagCreate(input: $input) {
    id
  }
}
"""
        variables = {"input": {"name": name}}
        result = self.__callGraphQL(query, variables)
        return result["tagCreate"]["id"]

    def findAudio(self, audio_id):
        query = """
query FindAudio($id: ID!) {
  findAudio(id: $id) {
    id
    tags {
      id
    }
    files {
      path
    }
  }
}
"""
        result = self.__callGraphQL(query, {"id": audio_id})
        return result["findAudio"]

    def findAllAudios(self):
        query = """
query FindAudios($filter: FindFilterType!) {
  findAudios(filter: $filter) {
    count
    audios {
      id
      tags {
        id
      }
      files {
        path
      }
    }
  }
}
"""
        variables = {"filter": {"per_page": -1}}
        result = self.__callGraphQL(query, variables)
        return result["findAudios"]["audios"]

    def setAudioTagIds(self, audio_id, tag_ids):
        query = """
mutation AudioUpdate($input: AudioUpdateInput!) {
  audioUpdate(input: $input) {
    id
  }
}
"""
        variables = {"input": {"id": audio_id, "tag_ids": tag_ids}}
        self.__callGraphQL(query, variables)
