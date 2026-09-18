export const TEMPLATES = [
  { value: 'social_media_linkedin', label: 'LinkedIn Post', description: 'Professional post for LinkedIn', icon: 'linkedin' },
  { value: 'social_media_twitter', label: 'Twitter/X Post', description: 'Short and snappy tweet', icon: 'twitter' },
  { value: 'social_media_instagram', label: 'Instagram Caption', description: 'Engaging caption for Instagram', icon: 'instagram' },
  { value: 'social_media_facebook', label: 'Facebook Post', description: 'Community-focused Facebook post', icon: 'facebook' },
  { value: 'email_subject_lines', label: 'Email Subject Lines', description: 'Catchy subjects for higher open rates', icon: 'mail' },
  { value: 'ad_copy_google', label: 'Google Ad Copy', description: 'Search intent focused ad copy', icon: 'search' },
  { value: 'ad_copy_meta', label: 'Meta Ad Copy', description: 'Scroll-stopping ad copy for FB/IG', icon: 'layout' },
  { value: 'blog_post_outline', label: 'Blog Post Outline', description: 'Structured outline for articles', icon: 'file-text' },
  { value: 'product_description', label: 'Product Description', description: 'Feature and benefit focused description', icon: 'shopping-bag' },
  { value: 'press_release', label: 'Press Release', description: 'Professional PR format', icon: 'megaphone' },
  { value: 'landing_page_hero', label: 'Landing Page Hero', description: 'High-converting headline and subheadline', icon: 'monitor' },
  { value: 'tagline_slogan', label: 'Tagline & Slogan', description: 'Memorable brand slogans', icon: 'tag' },
  { value: 'newsletter', label: 'Newsletter', description: 'Engaging newsletter content', icon: 'inbox' },
];

export const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'inspirational', label: 'Inspirational' },
];

export const LENGTHS = [
  { value: 'short', label: 'Short', description: '1-2 paragraphs' },
  { value: 'medium', label: 'Medium', description: '3-4 paragraphs' },
  { value: 'long', label: 'Long', description: '5+ paragraphs' },
];

export const IMAGE_PRESETS = [
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Post', width: 1200, height: 630 },
  { name: 'Facebook Cover', width: 820, height: 312 },
  { name: 'LinkedIn Banner', width: 1584, height: 396 },
  { name: 'Twitter/X Post', width: 1200, height: 675 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'Custom', width: 1024, height: 1024 },
];

export const IMAGE_STYLES = [
  'Photorealistic',
  'Illustration',
  '3D Render',
  'Flat Design',
  'Watercolor',
  'Minimalist',
];

export const VIDEO_DURATIONS = [
  { value: '2s', label: '2 Seconds' },
  { value: '3s', label: '3 Seconds' },
  { value: '5s', label: '5 Seconds' },
];

export const VIDEO_STYLES = [
  'Cartoon & 3D Animation',
  'Cinematic',
  'Product Showcase',
  'Social Media Clip',
  'Corporate',
  'Dynamic',
];

export const PHOTOSHOOT_MODES_LIST = [
  { id: 'product_shot', label: 'Studio Product Shot', description: 'Clean seamless studio or catalog background', aspect: '1:1', tag: 'Catalog' },
  { id: 'lifestyle_scene', label: 'Lifestyle Scene', description: 'Product in authentic real-world environment', aspect: '1:1', tag: 'Commercial' },
  { id: 'closeup_product_with_person', label: 'Person & Hands Closeup', description: 'Tight crop with hands or person holding product', aspect: '4:5', tag: 'Social' },
  { id: 'moodboard_pin', label: 'Moodboard Pin', description: 'Vertical 2:3 Pinterest-native editorial aesthetic', aspect: '9:16', tag: 'Pinterest' },
  { id: 'hero_banner', label: 'Hero Banner', description: 'Wide website, campaign, or email header with copy space', aspect: '16:9', tag: 'Web' },
  { id: 'social_carousel', label: 'Social Carousel Slide', description: 'Swipeable slide post for IG / LinkedIn / FB', aspect: '1:1', tag: 'Feed' },
  { id: 'ad_creative_pack', label: 'DTC Ad Creative Pack', description: 'High-converting ad visuals for Meta & TikTok', aspect: '4:5', tag: 'Ads' },
  { id: 'virtual_model_tryout', label: 'Virtual Model Tryout', description: 'Product showcased by an AI-rendered fashion model', aspect: '4:5', tag: 'Fashion' },
  { id: 'conceptual_product', label: 'Conceptual & Surreal', description: 'Levitating, dynamic liquid/powder splash, CGI render', aspect: '1:1', tag: 'Creative' },
  { id: 'restyle', label: 'Aesthetic Restyle', description: 'Elevated brand restyling & seasonal aesthetic', aspect: '1:1', tag: 'Brand' },
];
