# MoviePicker
How many hours have you spent scrolling through Netflix, then Amazon Prime, and then Binge, trying to find a movie to watch with your friends, all for you to settle and watch something you've already seen before? MoviePicker will solve this problem for you!

MoviePicker allows everyone in your group to 'like' movies that interest them to find a choice that suits everyone! When you like, if others in your group have also 'liked' on the same movie, it will appear as a match and would be a great choice for your group to watch together!

Access the site [here!](http://moviepicker-official-480dac16.s3-website-us-east-1.amazonaws.com/)

---

## Key Features
- **Up-To-Date Movie Data**
  -  Retrieves movie data from TMDB Movie API
  -  TMDB API is a comprehensive, detailed and constantly updated movie database
    
- **Group Sessions**
  - Create and Join group sessions
  - Able to specify movie genres, streaming platforms when creating a session
  - Set the 'match_threshold' - the percentage of users that need to 'like' a movie for a match to occur

- **'Like' Functionality**
  - Users can 'like' or 'dislike' a movie

- **Movie Match Functionality**
  - A match occurs when users in the session have 'liked' the same move
  - Real-time updates across all devices when a movie match occurrs
  - List of all movie matches for the current session

## Tech Stack
- **Frontend**: React, CSS
- **Backend**: Python, Flask
- **Deployment**: AWS using Terraform (ECS, S3, Lambda, APIGateway..)
