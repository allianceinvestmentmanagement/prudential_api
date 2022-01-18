const mongoose = require('mongoose'),
Schema   = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');
const FollowSchema = new Schema({
    follower: {
        type: mongoose.Schema.Types.Number,
        ref: 'User'
    },
    followee: {
        type: mongoose.Schema.Types.Number,
        ref: 'User'
    }
},
{
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
});
// FollowSchema.plugin(autoIncrement.plugin, 'Follow');
module.exports = mongoose.model('Follow', FollowSchema);