# TWEB2017-Github-Analytics-Client

This project was realized during the TWEB course at the HEIG-VD and is composed of two parts : a client (website) and an agent. The goal of the project is very simple: display information about the issues of a repository from github.

We use a [Bootstrap template](https://startbootstrap.com/template-categories/all/) to give the website a good look.

The website gets its data from the [_agent_](https://github.com/danpa32/TWEB2017-Github-Analytics-Server) which uses the [GitHub API v3](https://developer.github.com/v3/). The agent runs thanks to [Heroku](https://developer.github.com/v3/) and is scheduled to run every 24 hours. It share the data by pushing a JSON file containing the result of the request to the root folder of the website.

The website is hosted on GitHub Pages and can be found [here](https://danpa32.github.io/TWEB2017-Github-Analytics-Client/).


## Client

This repository contains the client part of the project. It uses HTML/CSS and JavaScript to display the content of the website and [Gulp](https://gulpjs.com/) to ease the test and build process.
