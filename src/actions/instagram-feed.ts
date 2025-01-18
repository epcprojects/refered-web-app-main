'use server';

import axios from 'axios';

export const getInstagramFeed = async () => {
  const endpoint = `https://graph.instagram.com/${process.env.INSTAGRAM_USER_ID}/media?access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}&fields=id,media,media_url,video_url,media_type,permalink&limit=7&media_type=IMAGE`;
  const response = await axios.get(endpoint);
  const data: { id: string; media_url: string; media_type: 'IMAGE'; permalink: string }[] = response.data.data;
  return data.filter((item) => item.media_type === 'IMAGE');
};
