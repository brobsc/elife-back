const express = require('express');

const storyRoute = express.Router();
const Story = require('../db/Story');

// New
storyRoute.route('/').post((req, res, next) => {
  Story.create(req.body, (error, data) => {
    if (error) {
      next(error);
    } else {
      res.status(201);
      res.json(data);
    }
  });
});

// All
storyRoute.route('/').get((req, res, next) => {
  Story.find((error, data) => {
    if (error) {
      next(error);
    } else {
      res.json(data);
    }
  });
});

// One
storyRoute.route('/:id').get((req, res, next) => {
  Story.findById(req.params.id, (error, data) => {
    if (error) {
      next(error);
    } else {
      res.json(data);
    }
  });
});


// Update employee
storyRoute.route('/:id').put((req, res, next) => {
  Story.findByIdAndUpdate(req.params.id, req.body,
    (error, data) => {
      if (error) {
        next(error);
      } else {
        res.json(data);
        console.log(`Data updated successfully on id: ${req.params.id}`);
      }
    });
});

// Delete employee
storyRoute.route('/:id').delete((req, res, next) => {
  Story.findByIdAndDelete(req.params.id, (error, _) => {
    if (error) {
      next(error);
    } else {
      res.status(204);
    }
  });
});

module.exports = storyRoute;
