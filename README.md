# Intercode 2

[![Build Status](https://travis-ci.org/neinteractiveliterature/intercode.svg?branch=master)](https://travis-ci.org/neinteractiveliterature/intercode)
[![Code Climate](https://codeclimate.com/github/neinteractiveliterature/intercode/badges/gpa.svg)](https://codeclimate.com/github/neinteractiveliterature/intercode)
[![Test Coverage](https://codeclimate.com/github/neinteractiveliterature/intercode/badges/coverage.svg)](https://codeclimate.com/github/neinteractiveliterature/intercode/coverage)

Intercode is a web application that:

* serves as the public-facing web site for a convention
* automates signup and payment
* automates business processes for the convention staff

The original Intercode was written in PHP by Barry Tannenbaum for Intercon New England, and has since been used by several other conventions around the world.

Intercode 2 is a ground-up rewrite of Intercode, making it more robust, more flexible, and more modern.

# Overall Architecture

* **Backend**: Ruby on Rails application exposing a GraphQL API and an OpenID Connect-enabled OAuth2 server
* **Frontend**: React and Apollo-based single-page JavaScript app
* **Database engine**: PostgreSQL
* **Background queue system**: Amazon SQS + Shoryuken (this might change in the future)
* **Production infrastructure**: For [New England Interactive Literature](http://interactiveliterature.org)'s installation of Intercode, we're hosting it on [Heroku](https://heroku.com) and running it as Docker containers (as opposed to using buildpacks).  In fact, trying to use Heroku buildpacks with this app won't work, because we use the C++-based libgraphqlparser on the server.  (If you figure out a way to make that work with buildpacks, please let @nbudin know, because he would really like to know.)

# Getting Started with Developing Intercode

* Intercode 2 in development mode uses `intercode.test` as its cookie domain.  If you use `localhost` to visit the site, that will mysteriously fail.  I'm going to try to make the site detect the wrong domain and redirect you, but for now, please just use the `intercode.test` domain name.
* We support (for now, at least) two development workflows: Docker Compose, and running Rails locally.  See the steps for both workflows below.

# Developer Quickstart with Docker Compose

This is a containerized development setup, and should work on Linux, macOS, and Windows.

1. Clone this repository: `git clone https://github.com/neinteractiveliterature/intercode.git`
2. Install Docker Community Edition: https://store.docker.com/search?type=edition&offering=community
  * _Optional, but recommended: on macOS, if you have the RAM to spare, we recommend increasing Docker's memory to 4GB.  (Go to Preferences -> Advanced to do this.)_
3. Edit your hosts file (typically found in `/etc/hosts` on Mac and Linux systems) and add the following line: `127.0.0.1 intercode.test`
4. From the Intercode source folder:
  1. Build and start the Docker image for Intercode: `docker-compose up -d` (this will take awhile)
  2. Install JavaScript packages: `docker-compose exec cat yarn install`
  3. Set up the database: `docker-compose exec cat bin/rails db:create db:migrate`
  4. Start up the Intercode server: `docker-compose exec cat bin/rails server`
  5. Start up the Webpack server: `docker-compose exec cat bin/webpack-dev-server`
5. You should now be able to go to http://intercode.test:5000 and see the app running!

If you want to automate the server running part of this, we shamelessly recommend
[Threeman](https://github.com/patientslikeme/threeman) for Mac and Linux users.

# Developer Quickstart with local Rails

This is the classic Rails development setup, and should work for Mac and Linux users.

1. Clone this repository: `git clone https://github.com/neinteractiveliterature/intercode.git`
2. Make sure you have a working C/C++ development toolchain installed.  On macOS, that's Xcode and its Command Line Tools.
3. Install [rbenv](https://github.com/sstephenson/rbenv#readme)
4. Install [ruby-build](https://github.com/sstephenson/ruby-build#readme)
5. Install the Ruby version Intercode requires: `rbenv install`
6. Install Bundler: `gem install bundler`
7. Edit your hosts file (typically found in `/etc/hosts` on Mac and Linux systems) and add the following line: `127.0.0.1 intercode.test`
8. From the Intercode source folder:
  1. Install all the dependencies of Intercode:
    1. Install PostgreSQL. With Homebrew: `brew install postgres`
    2. Make sure you have Node.js installed. With Homebrew: `brew install node`
    3. Make sure you have Yarn installed. With Homebrew: `brew install yarn`
    4. `bundle install`
  2. Set up your local database: `bin/rails db:create db:migrate`
  3. Install JavaScript packages: `yarn install`
  4. Start up the Intercode server: `bin/rails server`
  5. Start up the Webpack server: `bin/webpack-dev-server`
9. You should now be able to go to http://intercode.test:3000 and see the app running!

# Contacting us

To contact the Intercode 2 project team, you can:

* [File an issue or feature request here](https://github.com/neinteractiveliterature/issues)
* [Email Nat Budin](mailto:natbudin@gmail.com).

# Code of Conduct

Participants in the Intercode project are expected to follow the Contributor Covenant.  For details, [see CODE_OF_CONDUCT.md](https://github.com/neinteractiveliterature/intercode/blob/master/CODE_OF_CONDUCT.md).

# License

Intercode 2 is released under the terms and conditions of the MIT license.  Please see the LICENSE file for the full legalese.