exports.handler = async (event) => {
  try {
    const { shop, replyEmail, title, message, emails } = JSON.parse(event.body);
    
    if (!emails || emails.length === 0) {
      return { statusCode: 400, body: 'No emails provided' };
    }
    
    if (emails.length > 1000) {
      return { statusCode: 400, body: 'Maximum is 1000 emails per send' };
    }
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: (shop || 'ShopMail') + ' <hello@shopmailapp.com.ng>',
        to: emails.map(e => e.trim()),
        reply_to: replyEmail,
        subject: title || 'New Promo From Your Shop',
        html: `
          <div style="font-family: Arial; padding: 20px; max-width: 600px;">
            <h2>${title || ''}</h2>
            <p style="font-size: 16px; line-height: 1.6;">${message || ''}</p>
            <hr />
            <p>From: <b>${shop || ''}</b></p>
            <p>Reply to: ${replyEmail || ''}</p>
          </div>
        `
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      return { statusCode: 500, body: 'Resend error: ' + error };
    }
    
    return { statusCode: 200, body: 'Sent successfully' };
    
  } catch (error) {
    return { statusCode: 500, body: 'Server error: ' + error.message };
  }
};