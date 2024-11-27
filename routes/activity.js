const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');

router.get('/', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json({ activities });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const activity = new Activity({
      userId: req.user.userId,
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      date: req.body.date
    });
    await activity.save();
    res.status(201).json({ activity });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}); 