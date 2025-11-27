# Supabase Email Confirmation Template

## How to Apply

1. Go to **Supabase Dashboard** → Your Project → **Authentication** → **Email Templates**
2. Select **"Confirm signup"** template
3. Copy the HTML below into the template editor
4. Click **Save**

## Email Template HTML

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmez votre inscription</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #FDFCF8;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #E5E5E5;">
              <div style="font-size: 2rem; margin-bottom: 10px;">👗</div>
              <h1 style="margin: 0; font-size: 1.75rem; font-weight: 600; color: #1a1a1a;">Virtual Dressing</h1>
              <p style="margin: 8px 0 0; font-size: 0.9rem; color: #666;">Mode de Luxe avec Emmanuelle K</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 1.5rem; font-weight: 600; color: #1a1a1a;">Confirmez votre inscription</h2>
              
              <p style="margin: 0 0 20px; font-size: 1rem; line-height: 1.6; color: #333;">
                Bonjour,
              </p>
              
              <p style="margin: 0 0 30px; font-size: 1rem; line-height: 1.6; color: #333;">
                Merci de vous être inscrit(e) à Virtual Dressing ! Pour activer votre compte et commencer à découvrir nos looks élégants, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1rem; transition: background-color 0.2s;">
                      Confirmer mon email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 0.9rem; line-height: 1.6; color: #666;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              <p style="margin: 10px 0 0; font-size: 0.85rem; word-break: break-all; color: #888;">
                {{ .ConfirmationURL }}
              </p>
              
              <p style="margin: 30px 0 0; font-size: 0.9rem; line-height: 1.6; color: #666;">
                Ce lien expirera dans 24 heures.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #FAFAFA; border-top: 1px solid #E5E5E5; border-radius: 0 0 16px 16px;">
              <p style="margin: 0 0 10px; font-size: 0.85rem; color: #666; text-align: center;">
                Vous recevez cet email car vous vous êtes inscrit(e) sur Virtual Dressing.
              </p>
              <p style="margin: 0; font-size: 0.85rem; color: #999; text-align: center;">
                © 2025 Virtual Dressing. Tous droits réservés.
              </p>
              <p style="margin: 15px 0 0; font-size: 0.85rem; text-align: center;">
                <a href="{{ .SiteURL }}/about" style="color: #1a1a1a; text-decoration: none;">À propos</a> | 
                <a href="{{ .SiteURL }}" style="color: #1a1a1a; text-decoration: none;">Accueil</a>
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Social Links -->
        <table role="presentation" style="max-width: 600px; width: 100%; margin-top: 20px;">
          <tr>
            <td align="center" style="padding: 20px;">
              <p style="margin: 0 0 15px; font-size: 0.9rem; color: #666; font-weight: 600;">Suivez Emmanuelle K</p>
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="https://instagram.com/emmanuellek_" style="color: #1a1a1a; text-decoration: none; font-size: 0.85rem;">Instagram</a>
                  </td>
                  <td style="padding: 0 10px;">
                    <a href="https://tiktok.com/@emmanuellek" style="color: #1a1a1a; text-decoration: none; font-size: 0.85rem;">TikTok</a>
                  </td>
                  <td style="padding: 0 10px;">
                    <a href="https://youtube.com/@emmanuellek" style="color: #1a1a1a; text-decoration: none; font-size: 0.85rem;">YouTube</a>
                  </td>
                  <td style="padding: 0 10px;">
                    <a href="https://pinterest.com/emmanuellek" style="color: #1a1a1a; text-decoration: none; font-size: 0.85rem;">Pinterest</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Subject Line

```
Confirmez votre inscription à Virtual Dressing
```

## Available Variables

- `{{ .ConfirmationURL }}` - The confirmation link
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your site URL (configure in Supabase settings)
- `{{ .Token }}` - The confirmation token (if needed)
- `{{ .TokenHash }}` - Hashed token (if needed)

## Design Notes

- **Colors**: Matches your site (#FDFCF8 background, #1a1a1a text, #ffffff cards)
- **Font**: Public Sans (same as your site)
- **Style**: Clean, minimalist, matches your French fashion aesthetic
- **Responsive**: Works on mobile and desktop
- **Branding**: Includes Virtual Dressing logo (👗 emoji) and Emmanuelle K branding

## English Version

If you want an English version, use this subject line and replace the French text:

**Subject:**
```
Confirm Your Signup to Virtual Dressing
```

**Key Text Changes:**
- "Confirmez votre inscription" → "Confirm your signup"
- "Bonjour" → "Hello"
- "Merci de vous être inscrit(e)" → "Thank you for signing up"
- "Confirmer mon email" → "Confirm my email"
- "Ce lien expirera dans 24 heures" → "This link will expire in 24 hours"

## Important: Site URL Configuration

Before using the template, make sure to set your Site URL in Supabase:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://digital-wardrobe-puce.vercel.app` (or your production domain)
3. This ensures `{{ .SiteURL }}` variable works correctly

## Additional Customization

You can also customize:
- **Magic Link** template (for passwordless login)
- **Change Email Address** template
- **Reset Password** template
- **Email Change** template

All follow the same design pattern.

## Testing

After saving the template:
1. Sign up with a test email
2. Check the email inbox
3. Verify the design matches your site
4. Test the confirmation link works

