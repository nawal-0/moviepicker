from moviepicker.models.tmdb_api.tmdb_client import TMDBClient
import unittest
from moviepicker.models.tmdb_api.api_enums import Genre, Provider, WatchRegion, Language
from unittest.mock import patch

class TestTMDBClient(unittest.TestCase):
    def setUp(self):
        self.client = TMDBClient()

    @patch("moviepicker.models.tmdb_api.tmdb_client.requests.get")
    def test_get_movies_mocked(self, mock_get):
        mock_get.return_value.json.return_value = {
            "results": [{"id": 1, "title": "Test Movie", "overview": "Test", "vote_average": 7.5}]
        }
        result = self.client.get_movies()
        self.assertIn("results", result)
        self.assertIsInstance(result["results"], list)
        self.assertIn("id", result["results"][0])
        self.assertIn("title", result["results"][0])

    @patch("moviepicker.models.tmdb_api.tmdb_client.requests.get")
    def test_get_movie_ids_mocked(self, mock_get):
        mock_get.return_value.json.return_value = {
            "results": [{"id": 123}, {"id": 456}]
        }
        ids = self.client.get_movie_ids()
        self.assertIsInstance(ids, list)
        self.assertEqual(ids, [123, 456])

    @patch("moviepicker.models.tmdb_api.tmdb_client.requests.get")
    def test_get_id_data_mocked(self, mock_get):
        mock_get.return_value.json.return_value = {
            "title": "Mock Movie", "id": 950387
        }
        result = self.client.get_id_data(950387)
        self.assertEqual(result["title"], "Mock Movie")

    def test_data_output(self):
        result = self.client.get_movie_ids()
        self.assertIsInstance(result, list)
        self.assertEqual(20, len(result))

    def get_id_data(self):
        result = self.client.get_id_data(950387) #Minecraft movie
        self.assertEqual(result["title"], "A Minecraft Movie")

    def test_genre_enum_values(self):
        self.assertEqual(Genre.ACTION.value, 28)
        self.assertTrue(isinstance(Genre.COMEDY, Genre))

    def test_provider_enum_values(self):
        self.assertEqual(Provider.NETFLIX.value, 8)
        self.assertIn(Provider.DISNEY_PLUS, Provider)

    def test_watch_region_enum(self):
        self.assertEqual(WatchRegion.AUSTRALIA.value, "AU")

    def test_language_enum(self):
        self.assertEqual(Language.ENGLISH.value, "en")

    def test_basic_placeholder(self):
        self.assertTrue(True)  # Sanity check

if __name__ == "__main__":
    unittest.main()
