const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    sparse: true, // Allow null values, but ensure uniqueness when present
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    // Only required for email authentication, not for Google OAuth
    required: function() {
      return this.authMethod === 'email' && !this.googleId;
    }
  },
  avatar: {
    type: String,
    default: null
  },
  authMethod: {
    type: String,
    enum: ['email', 'google'],
    required: true,
    default: 'email'
  },
  isEmailVerified: {
    type: Boolean,
    default: function() {
      // Google OAuth users are automatically verified
      return this.authMethod === 'google';
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to generate avatar URL if none exists
userSchema.methods.getAvatarUrl = function() {
  if (this.avatar) {
    return this.avatar;
  }
  // Generate a default avatar using the user's initials
  const initials = this.name.split(' ').map(n => n[0]).join('').toUpperCase();
  return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=200`;
};

// Static method to find user by email (case-insensitive)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.getAvatarUrl(),
    authMethod: this.authMethod,
    isEmailVerified: this.isEmailVerified,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt
  };
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);