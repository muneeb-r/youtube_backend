import { createError } from "../error.js";
import User from "../models/User.js";
import Video from "../models/Video.js";

export const addVideo = async (req, res, next) => {
    try {
        const newVideo = new Video({ userId: req.user.id, ...req.body })
        const addedVideo = await newVideo.save()
        res.status(200).json(addedVideo)
    } catch (err) {
        next(err);
    }
}

export const updateVideo = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id)
        if (!video) return next(createError(404, 'Not found'))
        if (req.user.id === video.userId) {
            const updatedVideo = await Video.findByIdAndUpdate(
                req.params.id,
                {
                    $set: req.body,
                },
                { new: true }
            );
            return res.status(200).json(updatedVideo);
        } else {
            return next(createError(403, 'You can update only your video!'))
        }
    } catch (err) {
        next(err);
    }
}

export const deleteVideo = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id)
        if (!video) return next(createError(404, 'Not found'))
        if (req.params.id === video.userId) {
            await Video.findByIdAndDelete(req.params.id);
            res.status(200).json("Video has been deleted.");
        } else {
            return next(createError(403, 'You can delete only your video!'))
        }
       
    } catch (err) {
        next(err);
    }
}

export const getVideo = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id);
        return res.status(200).json(video);
    } catch (err) {
        next(err);
    }
}

export const addView = async (req, res, next) => {
    try {
        await Video.findByIdAndUpdate(req.params.id, {
          $inc: { views: 1 },
        });
        res.status(200).json({
            message: 'The view has been increased.',
            error: false
          });
    } catch (err) {
    next(err);
    }
}

export const getTrend = async (req, res, next) => {
    try {
        const videos = await Video.find().sort({ views: -1 });
        res.status(200).json(videos);
    } catch (err) {
    next(err);
    }
}

export const getRandom = async (req, res, next) => {
    try {
        const videos = await Video.aggregate([{ $sample: { size: 40 } }]);
        res.status(200).json(videos);
    } catch (err) {
    next(err);
    }
}

export const getSubscribed = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const subscribedChannels = user.subscribedUsers;
    
        const list = await Promise.all(
          subscribedChannels.map(async (channelId) => {
            return await Video.find({ userId: channelId });
          })
        );
        res.status(200).json(list.flat().sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
    next(err);
    }
}

export const getByTag = async (req, res, next) => {
    const tags = req.query.tags.split(",");
    try {
      const videos = await Video.find({ tags: { $in: tags } }).limit(20);
      res.status(200).json(videos);
    } catch (err) {
      next(err);
    }
  };
  
  export const search = async (req, res, next) => {
    const query = req.query.q;
    try {
      const videos = await Video.find({
        title: { $regex: query, $options: "i" },
      }).limit(40);
      res.status(200).json(videos);
    } catch (err) {
      next(err);
    }
  };