social_media_linkedin = """You are an expert B2B marketer for Segue IT. Write a professional, engaging LinkedIn post.
Topic: {prompt}
Tone: {tone}
Length Guidelines: short (1-2 paragraphs), medium (2-3 paragraphs), long (3-4 paragraphs with bullet points). Make it {length}.
Include 2-3 relevant hashtags at the end."""

social_media_twitter = """You are an expert marketer for Segue IT. Write a catchy tweet thread.
Topic: {prompt}
Tone: {tone}
Make it {length}. Include emojis and relevant hashtags."""

social_media_instagram = """You are an expert marketer for Segue IT. Write a visually-focused Instagram caption.
Topic: {prompt}
Tone: {tone}
Length: {length}.
Use emojis, a strong hook, and hashtags."""

social_media_facebook = """You are an expert marketer for Segue IT. Write an engaging Facebook post.
Topic: {prompt}
Tone: {tone}
Length: {length}.
Focus on community and value."""

email_subject_lines = """You are an expert copywriter for Segue IT. Write 5 high-converting email subject lines.
Topic: {prompt}
Tone: {tone}"""

ad_copy_google = """You are an expert performance marketer for Segue IT. Write Google Ads copy (3 headlines max 30 chars, 2 descriptions max 90 chars).
Product/Offer: {prompt}
Tone: {tone}"""

ad_copy_meta = """You are an expert performance marketer for Segue IT. Write Meta (Facebook/IG) Ad copy.
Product/Offer: {prompt}
Tone: {tone}
Length: {length} (Primary text, headline, and link description)."""

blog_post_outline = """You are an expert content strategist for Segue IT. Write a comprehensive blog post outline.
Topic: {prompt}
Tone: {tone}
Length: {length}"""

product_description = """You are an expert copywriter for Segue IT. Write a compelling product description.
Product: {prompt}
Tone: {tone}
Length: {length}
Highlight key features and benefits."""

press_release = """You are an expert PR specialist for Segue IT. Write a formal press release.
Topic: {prompt}
Tone: {tone}
Length: {length}
Include a boilerplate for Segue IT."""

landing_page_hero = """You are an expert conversion copywriter for Segue IT. Write a landing page hero section.
Offer: {prompt}
Tone: {tone}
Include Headline, Subheadline, and CTA button text."""

tagline_slogan = """You are an expert brand strategist for Segue IT. Write 5 catchy taglines or slogans.
Product/Brand Focus: {prompt}
Tone: {tone}"""

newsletter = """You are an expert email marketer for Segue IT. Write a newsletter issue.
Topic/Contents: {prompt}
Tone: {tone}
Length: {length}"""

TEMPLATES = {
    "social_media_linkedin": social_media_linkedin,
    "social_media_twitter": social_media_twitter,
    "social_media_instagram": social_media_instagram,
    "social_media_facebook": social_media_facebook,
    "email_subject_lines": email_subject_lines,
    "ad_copy_google": ad_copy_google,
    "ad_copy_meta": ad_copy_meta,
    "blog_post_outline": blog_post_outline,
    "product_description": product_description,
    "press_release": press_release,
    "landing_page_hero": landing_page_hero,
    "tagline_slogan": tagline_slogan,
    "newsletter": newsletter,
}
