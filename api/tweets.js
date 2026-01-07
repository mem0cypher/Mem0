module.exports = async (req, res) => {
  try {
    const bearer = process.env.X_BEARER_TOKEN;
    if (!bearer) {
      res.statusCode = 501;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'X_BEARER_TOKEN_NOT_CONFIGURED'
        })
      );
      return;
    }

    const username = (req.query && req.query.username) || 'mem0cypher';

    const baseHeaders = {
      Authorization: `Bearer ${bearer}`
    };

    const userResp = await fetch(
      `https://api.twitter.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=profile_image_url`,
      { headers: baseHeaders }
    );

    if (!userResp.ok) {
      const text = await userResp.text();
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'X_API_USER_LOOKUP_FAILED',
          status: userResp.status,
          details: text
        })
      );
      return;
    }

    const userJson = await userResp.json();
    const user = userJson && userJson.data;

    if (!user || !user.id) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'X_USER_NOT_FOUND'
        })
      );
      return;
    }

    const tweetsResp = await fetch(
      `https://api.twitter.com/2/users/${encodeURIComponent(user.id)}/tweets?max_results=10&exclude=replies,retweets&tweet.fields=created_at,public_metrics`,
      { headers: baseHeaders }
    );

    if (!tweetsResp.ok) {
      const text = await tweetsResp.text();
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'X_API_TWEETS_FETCH_FAILED',
          status: tweetsResp.status,
          details: text
        })
      );
      return;
    }

    const tweetsJson = await tweetsResp.json();
    const tweets = (tweetsJson && tweetsJson.data) || [];

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.end(
      JSON.stringify({
        username,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          profile_image_url: user.profile_image_url
        },
        tweets
      })
    );
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'UNEXPECTED_ERROR',
        message: e && e.message ? e.message : String(e)
      })
    );
  }
};
