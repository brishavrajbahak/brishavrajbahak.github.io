// utils/email.js - Email utility
const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransporter({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    
    async sendContactNotification(contact) {
        const emailTemplate = `
            <div style="font-family: 'Orbitron', monospace; background: #0a0a0a; color: #00ffff; padding: 20px;">
                <h2 style="color: #ff0080;">🌆 New Contact Message - NeonCity Portfolio</h2>
                
                <div style="background: rgba(0, 255, 255, 0.1); padding: 15px; border: 1px solid #00ffff; border-radius: 10px; margin: 20px 0;">
                    <p><strong>Name:</strong> ${contact.name}</p>
                    <p><strong>Email:</strong> ${contact.email}</p>
                    <p><strong>Subject:</strong> ${contact.subject || 'No subject'}</p>
                    <p><strong>Time:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
                </div>
                
                <div style="background: rgba(255, 0, 128, 0.1); padding: 15px; border: 1px solid #ff0080; border-radius: 10px;">
                    <p><strong>Message:</strong></p>
                    <p style="line-height: 1.6;">${contact.message}</p>
                </div>
                
                <div style="margin-top: 20px; font-size: 12px; color: #666;">
                    <p>IP Address: ${contact.ipAddress}</p>
                    <p>User Agent: ${contact.userAgent}</p>
                </div>
            </div>
        `;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'brishav@neoncity.dev',
            subject: `🌆 New Contact: ${contact.name} - ${contact.subject || 'Portfolio Contact'}`,
            html: emailTemplate
        };
        
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('📧 Contact notification sent');
        } catch (error) {
            console.error('❌ Email send failed:', error);
        }
    }
    
    async sendWelcomeEmail(user) {
        const emailTemplate = `
            <div style="font-family: 'Orbitron', monospace; background: #0a0a0a; color: #00ffff; padding: 20px;">
                <h1 style="color: #ff0080; text-align: center;">Welcome to NeonCity!</h1>
                
                <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; background: linear-gradient(45deg, #ff0080, #00ffff); padding: 2px; border-radius: 10px;">
                        <div style="background: #0a0a0a; padding: 20px; border-radius: 8px;">
                            <h2 style="margin: 0; color: #00ffff;">Neural Link Established</h2>
                        </div>
                    </div>
                </div>
                
                <p>Hello <strong style="color: #ffff00;">${user.username}</strong>,</p>
                
                <p>Your account has been successfully created in the NeonCity network. You now have access to exclusive content and features.</p>
                
                <div style="background: rgba(0, 255, 255, 0.1); padding: 15px; border: 1px solid #00ffff; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #ff0080; margin-top: 0;">Account Details:</h3>
                    <p><strong>Username:</strong> ${user.username}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                    <p><strong>Join Date:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}" style="display: inline-block; padding: 15px 30px; background: linear-gradient(45deg, #ff0080, #00ffff); color: #000; text-decoration: none; font-weight: bold; border-radius: 25px;">
                        Enter the Matrix
                    </a>
                </div>
                
                <p style="font-size: 12px; color: #666; text-align: center; margin-top: 40px;">
                    Welcome to the future. Stay connected to the grid.
                </p>
            </div>
        `;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: '🌆 Welcome to NeonCity - Neural Link Established',
            html: emailTemplate
        };
        
        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`📧 Welcome email sent to ${user.email}`);
        } catch (error) {
            console.error('❌ Welcome email failed:', error);
        }
    }
}

module.exports = new EmailService();
