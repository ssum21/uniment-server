const mongoose = require('mongoose');

const creditSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  category: {
    type: String,
    enum: ['전체', '전공', '교양', '기타'],
    required: true
  },
  subCategory: {
    type: String,
    enum: ['필수', '선택', '기초', '심화', '자유'],
    required: true
  },
  credits: {
    required: {
      type: Number,
      required: true
    },
    current: {
      type: Number,
      required: true
    },
    remaining: {
      type: Number,
      default: function() {
        if (this.credits && typeof this.credits.required === 'number' && 
            typeof this.credits.current === 'number') {
          return this.credits.required - this.credits.current;
        }
        return 0;
      }
    }
  }
}, {
  timestamps: true
});

// remaining 필드를 저장 전에 계산
creditSchema.pre('save', function(next) {
  if (this.credits && typeof this.credits.required === 'number' && 
      typeof this.credits.current === 'number') {
    this.credits.remaining = this.credits.required - this.credits.current;
  }
  next();
});

module.exports = mongoose.model('Credit', creditSchema);