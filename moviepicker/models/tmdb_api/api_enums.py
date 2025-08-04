from enum import Enum

class Genre(Enum):
    ACTION = 28
    ADVENTURE = 12
    ANIMATION = 16
    COMEDY = 35
    CRIME = 80
    DOCUMENTARY = 99
    DRAMA = 18
    FAMILY = 10751
    FANTASY = 14
    HISTORY = 36
    HORROR = 27
    MUSIC = 10402
    MYSTERY = 9648
    ROMANCE = 10749
    SCIENCE_FICTION = 878
    TV_MOVIE = 10770
    THRILLER = 53
    WAR = 10752
    WESTERN = 37

class Provider(Enum):
    NETFLIX = 8
    STAN = 21
    DISNEY_PLUS = 337
    AMAZON_PRIME = 119
    BINGE = 385
    PARAMOUNT_PLUS = 531
    APPLE_TV_PLUS = 2
    FOXTEL_NOW = 134
    SBS_ON_DEMAND = 132
    ABC_IVIEW = 135

class WatchRegion(Enum):
    AUSTRALIA = "AU"
    UNITED_STATES = "US"
    UNITED_KINGDOM = "GB"
    CANADA = "CA"
    NEW_ZEALAND = "NZ"
    GERMANY = "DE"
    FRANCE = "FR"
    INDIA = "IN"
    JAPAN = "JP"
    BRAZIL = "BR"

# even though the application won't be multi-lingual the
# user may still like different languages
class Language(Enum):
    ENGLISH = "en"
    FRENCH = "fr"
    GERMAN = "de"
    SPANISH = "es"
    JAPANESE = "ja"
    CHINESE_SIMPLIFIED = "zh"
    HINDI = "hi"
    ITALIAN = "it"
    KOREAN = "ko"
    PORTUGUESE = "pt"
    RUSSIAN = "ru"



