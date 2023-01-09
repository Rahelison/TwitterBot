/**
 * // Install the twit npm module
const Twit = require('twit');

// Configure the Twitter API keys and tokens
const T = new Twit({
    consumer_key: '',
    consumer_secret: '',
    access_token: '',
    access_token_secret: '',
});

// Use the Twitter RESTful API to track the hashtag “ESTIAM”
const params = { q: 'ESTIAM' };
T.get('search/tweets', params, function(err, data, response) {
    if (err) console.log(err);
    else {
        // Save the tweets in a database such as MongoDB
        // Use the Twitter Streaming API to listen for new tweets that contain the hashtag and store them in the database as well
    }
});

// Use the twit npm module to retweet the posts containing the hashtag
T.post('statuses/retweet/:id', { id: 'tweet_id' }, function(err, data, response) {
    if (err) console.log(err);
});

**/

// Node.js server
// Require express
const express = require('express');

// Create an instance of an Express server
const app = express();

// Load the Twitter API
const Twitter = require('twitter');

// Database management
const mongoose = require('mongoose');
const db = mongoose.connection;

// Twitter credentials
const twitterCreds = {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
};

// twitter object with credentials
const client = new Twitter(twitterCreds);

// connect to mongodb
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to the database!');
});

// listen on port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// search for hashtag ESTIAM every 15 minutes
setInterval(function() {
    client.get('search/tweets', {
        q: '#ESTIAM'
    }, function(error, data, response) {
        if (error) {
            console.log(error);
        } else {
            const tweets = data.statuses;
            // like tweets
            tweets.forEach(tweet => {
                client.post('favorites/create', {
                    id: tweet.id_str
                }, function(error, response) {
                    if (error) {
                        console.log(error[0]);
                    }
                });
            });
            // retweet tweets
            tweets.forEach(tweet => {
                client.post('statuses/retweet', {
                    id: tweet.id_str
                }, function(error, response) {
                    if (error) {
                        console.log(error[0]);
                    }
                });
            });
            // follow users
            tweets.forEach(tweet => {
                client.get('followers/ids', {
                    screen_name: tweet.user.screen_name
                }, function(error, response) {
                    if (error) {
                        console.log(error[0]);
                    } else {
                        if (response.ids.length > 100) {
                            client.post('friendships/create', {
                                screen_name: tweet.user.screen_name
                            }, function(error, response) {
                                if (error) {
                                    console.log(error[0]);
                                }
                            });
                        }
                    }
                });
            });
        }
    });
}, 900000);