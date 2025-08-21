#!/usr/bin/env node

/**
 * Email Setup Test Script
 * Run this to verify your nodemailer email reminder system is working
 */

import dotenv from 'dotenv';
import { testEmailConnection, sendReminderEmail } from './services/emailReminder.service.js';

// Load environment variables
dotenv.config();

console.log('📧 Testing Email Reminder System');
console.log('================================\n');

async function testEmailSetup() {
  try {
    // Test 1: Check environment variables
    console.log('1️⃣ Checking environment variables...');
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailService = process.env.EMAIL_SERVICE;

    if (!emailUser || !emailPass || !emailService) {
      console.log('❌ Missing email environment variables!');
      console.log('   Required: EMAIL_USER, EMAIL_PASS, EMAIL_SERVICE');
      console.log('   Current values:');
      console.log(`   EMAIL_USER: ${emailUser ? '✅ Set' : '❌ Missing'}`);
      console.log(`   EMAIL_PASS: ${emailPass ? '✅ Set' : '❌ Missing'}`);
      console.log(`   EMAIL_SERVICE: ${emailService ? '✅ Set' : '❌ Missing'}`);
      return;
    }
    console.log('✅ Environment variables configured\n');

    // Test 2: Test email connection
    console.log('2️⃣ Testing email connection...');
    await testEmailConnection();
    console.log('✅ Email connection successful\n');

    // Test 3: Send test email (if email provided as argument)
    const testEmail = process.argv[2];
    if (testEmail) {
      console.log('3️⃣ Sending test email...');
      const testData = {
        renterName: 'Test User',
        productName: 'Test Rental Item',
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        bookingId: 'TEST123'
      };

      const result = await sendReminderEmail(testEmail, 'reminder', testData);
      
      if (result.success) {
        console.log(`✅ Test email sent to ${testEmail}`);
        console.log(`   Message ID: ${result.messageId}`);
      } else {
        console.log(`❌ Failed to send test email: ${result.error}`);
      }
    } else {
      console.log('3️⃣ Skipping test email (no email provided)');
      console.log('   To test: node test-email-setup.js your-email@example.com');
    }

    console.log('\n🎉 Email reminder system is ready!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start your server: npm start');
    console.log('   2. The cron job will run every 5 minutes automatically');
    console.log('   3. Manual trigger: POST http://localhost:3000/api/reminders/trigger');
    console.log('   4. Check stats: GET http://localhost:3000/api/reminders/stats');
    
  } catch (error) {
    console.error('❌ Email setup test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your Gmail app password is correct');
    console.log('   2. Ensure 2FA is enabled on your Gmail account');
    console.log('   3. Verify EMAIL_USER is your full Gmail address');
    console.log('   4. Check internet connection');
  }
}

testEmailSetup();
