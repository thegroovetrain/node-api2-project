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

                if(post.length == 0) {
                    return res.status(404).json({message: "The post with the specified ID does not exist."})
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
    } catch(err) {
        res.status(500).json({error: "There was an error while saving the comment to the database."});
    }
});

server.get("/api/posts", (req, res) => {
    try {
        db.find()
            .then(posts => {
                return res.status(200).json(posts)
            })
    } catch(err) {
        res.status(500).json({error:"The posts information could not be retrieved."});
    }
});

server.get("/api/posts/:id", (req, res) => {
    try {
        db.findById(req.params.id)
            .then(post => {
                if(post.length == 0) {
                    return res.status(404).json({message: "The post with the specified ID does not exist."})
                }

                return res.status(200).json(post)
            })
    } catch(err) {
        res.status(500).json({error:"The post information could not be retrieved."})
    }
})

server.get("/api/posts/:id/comments", (req, res) => {
    try {
        const id = req.params.id;
        db.findById(id)
            .then(post => {
                if(post.length == 0) {
                    return res.status(404).json({message: "The post with the specified ID does not exist."})
                }

                db.findPostComments(id)
                    .then(comments => {
                        return res.status(200).json(comments)
                    })
            })
    } catch(err) {
        res.status(500).json({error:"The comments information could not be retrieved."})
    }
})

server.delete("/api/posts/:id", (req, res) => {
    try {
        const id=req.params.id;
        db.findById(id)
            .then(post => {
                if(post.length == 0) {
                    return res.status(404).json({message:"The post with the specified ID does not exist."})
                }

                db.remove(id)
                    .then(o => {
                        return res.status(200).json(post)
                    })
            })
    } catch(err) {
        res.status(500).json({error:"The post could not be removed."})
    }
})

server.put("/api/posts/:id", (req, res) => {
    try {
        const id=req.params.id;
        if (!req.body.title || !req.body.contents) {
            return res.status(400).json({errorMessage:"Please provide a title and contents for the post."})
        }

        const updatedPost = {
            title: req.body.title,
            contents: req.body.contents
        }

        db.update(id, updatedPost)
            .then(o => {
                if (o != 1) {
                    return res.status(404).json({message:"The post with the specified ID does not exist."})
                }

                db.findById(id)
                    .then(post => {
                        return res.status(200).json(post)
                    })
            })
    } catch(err) {
        res.status(500).json({error:"The post information could not be modified."})
    }
})

server.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});