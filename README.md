# MoviePicker
How many hours have you spent scrolling through Netflix, then Amazon Prime, and then Binge, trying to find a movie to watch with your friends, all for you to settle and watch something you've already seen before? MoviePicker will solve this problem for you!

MoviePicker allows everyone in your group to 'like' movies that interest them to find a choice that suits everyone! When you like, if others in your group have also 'liked' on the same movie, it will appear as a match and would be a great choice for your group to watch together!

[Website Link](http://moviepicker-official-480dac16.s3-website-us-east-1.amazonaws.com/))


## Key Features
The key functionalities of the MoviePicker application are:
- Retrieving up-to-date movie data from TMDB Movie API
- Creating/deleting group sessions
  - Able to specify movie genres, streaming platforms when creating a session
  - Set the 'match_threshold' - the percentage of users that need to 'like' a movie for a match to occur
- Join group sessions
- Simple swiping functionality to 'like' or 'dislike' a movie
- Real-time updates across all devices when a movie match has occurred
- List of all movie matches for the current session

## Tech Stack
- Frontend: React, CSS
- Backend: Python, Flask
- Deployment: AWS using Terraform (ECS, Lambda, APIGateway..)
