const express = require('express');
const db = require('./data/db.js');

const server = express();
server.use(express.json());

server.post("/api/posts", (req, res) => {
    try {
        
        if (!req.body.title || !req.body.contents) {
            return res.status(400).json({errorMessage: "Please provide title and contents for the post"});
        }
        
        const newPost = {
            title: req.body.title,
            contents: req.body.contents
        };

        db.insert(newPost)
            .then(o => {
                db.findById(o.id)
                    .then(post => {
                        return res.status(201).json(post);
                    });
            });

    } catch(err) {
        res.status(500).json({error: "There was an error while saving the post to the database"});
    }
});

server.post("/api/posts/:id/comments", (req, res) => {
    try {

        const id = req.params.id;
        
        db.findById(id)
            .then(post => {
                if(!req.body.text) {
                    return res.status(400).json({errorMessage: "Please provide text for the comment"});
                }
        
                const newComment = {
                    post_id: id,
                    text: req.body.text,
                };
        
                db.insertComment(newComment)
                    .then(o => {
                        db.findCommentById(o.id)
                            .then(comment => {
                                return res.status(201).json(comment);
                            });
                    })
            })
            .catch(err => {
                return res.status(404).json({message: "The post with the specified ID does not exist."})
            })        
    } catch(err) {
        res.status(500).json({error: "There was an error while saving the comment to the database"});
    }
}) 

server.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
})