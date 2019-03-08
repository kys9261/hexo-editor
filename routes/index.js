'use strict';
const express = require('express');
const router = express.Router();
const yaml = require('js-yaml');
const fs = require('fs');
const config = yaml.safeLoad(fs.readFileSync('./_config.yml', 'utf8'));
const Manager = require('../models/file-manager');
const Caller = require('../models/hexo-caller');
const Article = require('../models/article');
const util = require('../models/util');
const cache = require('../models/cache');
const busboy = require('connect-busboy');

const caller = new Caller(config.base_dir);
const manager = new Manager(config.base_dir);

const cache_name = 'cache';

router.get('/logout', (req, res, next) => {
  const username = req.session.username;
  console.log(username + ' logout');
  req.session.username = null;
  res.redirect('/');
});

router.get('/post', (req, res, next) => {
  const articleId = req.query.id;
  cache.get(articleId, (article) => {
    res.send(article.content);
  });
});

router.get('/cache', (req, res, next) => {
  const cachedArticleId = cache_name + req.query.id;
  cache.get(cachedArticleId, (cachedArticle) => {
    if (!cachedArticle) {
      cache.get(req.query.id, (article) => {
        res.send(article);
      })
    } else {
      res.send(cachedArticle);
    }
  });
});

router.get('/generate', (req, res, next) => {
  caller.generate((msg) => {
    res.send(msg);
  });
});

router.get('/deploy', (req, res, next) => {
  caller.deploy((msg) => {
    res.send(msg);
  });
});

module.exports = router;
