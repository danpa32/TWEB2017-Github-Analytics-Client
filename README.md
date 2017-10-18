# TWEB2017-Github-Analytics-Client

This project was realized during the TWEB course at the HEIG-VD and is composed of two parts : a client (website) and an agent. The goal of the project is very simple: display information about the issues of a repository from github.

We use a [Bootstrap template](https://startbootstrap.com/template-categories/all/) to give the website a good look.

The website gets its data from the [agent](https://github.com/danpa32/TWEB2017-Github-Analytics-Agent) which uses the [GitHub API v3](https://developer.github.com/v3/). The agent runs thanks to [Heroku](https://developer.github.com/v3/) and is scheduled to run every 24 hours. It share the data by pushing a JSON file containing the result of the request to the root folder of the website.

The website is hosted on GitHub Pages and can be found [here](https://danpa32.github.io/TWEB2017-Github-Analytics-Client/).


## Client

This repository contains the client part of the project. It uses HTML/CSS and JavaScript to display the content of the website and [Gulp](https://gulpjs.com/) to ease the test and build process.

## Build and run

1. You need to place yourself in the **TWEB2017-Github-Analytics-Client repository**
2. Execute `npm install` in the terminal
3. Execute `gulp serve` in the terminal
    a. You must have installed the gulp client with the command `npm install -g gulp-cli`
    b. The compiled files are present in the `dist` folder.
4. If the browser doesn't open itself, open it and go to `http://localhost:8080/`
