# Create ubuntu image
FROM node:latest

# Maintainers
LABEL maintainer="daniel.palumbo@heig-vd.ch"
LABEL maintainer="christopher.meier@heig-vd.ch"

# install http-server
RUN npm install -g http-server

# Create a symlink to nodjs
RUN ln -s /usr/bin/nodejs /usr/bin/node

# Add file to container
ADD src /usr/apps/gitAnalysis/

WORKDIR /usr/apps/gitAnalysis/

# Run http-server in silent mode
CMD ["http-server", "-s"] 