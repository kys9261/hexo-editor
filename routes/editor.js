'use strict';
const express = require('express');
const router = express.Router();
const yaml = require('js-yaml');
const fs = require('fs');
const config = yaml.safeLoad(fs.readFileSync('./_config.yml', 'utf8'));
const Manager = require('../models/file-manager');
const cache = require('../models/cache');
const busboy = require('connect-busboy');

const manager = new Manager(config.base_dir);

const cache_name = 'cache';

router.get('/', (req, res, next) => {
  const articleId = req.query.id;
  cache.get(articleId, (article) => {
    if (!article) {
      article = {'title': 'Untitled', 'date': '', 'tags': '',
                 'categories': '', 'content': '', 'key': '', 'thumbnail':''};
    }
    res.render('editor', {'article': article});
  });
});

router.post('/image', (req, res, next) => {
  let fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', (fieldname, file, filename) => {
    fstream = fs.createWriteStream(config.base_dir + '/source/images/' + filename);
    file.pipe(fstream);
    fstream.on('close', () => {
        res.send('/images/' + filename);
    });
  });
});

router.get('/publish', (req, res, next) => {
  const articleId = req.query.id;
  const workspace = req.query.workspace;
  cache.get(articleId, (article) => {
    manager.moveToPost(article, workspace);
  });
  res.send('Already move to posts.');
});

router.get('/stash', (req, res, next) => {
  const articleId = req.query.id;
  const workspace = req.query.workspace;
  cache.get(articleId, (article) => {
    manager.moveToDraft(article, workspace);
  });
  res.send('Already move to drafts.');
});

router.get('/delete', (req, res, next) => {
  const articleId = req.query.id;
  const workspace = req.query.workspace;
  cache.get(articleId, (article) => {
    manager.moveToTrash(article, workspace);
  });
  res.send('Already move to trash.');
});

router.get('/delete0', (req, res, next) => {
  const articleId = req.query.id;
  cache.get(articleId, (article) => {
    manager.deletePost(article);
  });
  res.send('success');
});

module.exports = router;
