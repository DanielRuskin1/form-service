"use strict";

const uuid = require("node-uuid");
const getArg = require("../../common/get_arg");

// This is a very basic test suite and should be expanded at some point.
// In particular, we should have:
// 1. Isolated component unit testing, which verifies that API calls are made.
// 2. Unit testing on the backend, which verifies different error cases
module.exports = {
  "Application works": (client) => {
    // Generate UUID for contact form name, and an XPath query to get the contact form.
    // We will use this to assert the form shows up
    const generatedUuid = uuid.v4();
    const contactFormXpath = "//div[@class='contactForm' and contains(., '" + generatedUuid + "')]";

    const contactFormSuccessXpath = "//div[@class='contactFormBox']//div[@class='resultSuccessBox']";
    const messageSuccessXpath = contactFormXpath + "//div[@class='resultSuccessBox']";

    // Visit page
    client
      .useXpath()
      .url("http://localhost:8000")
      .waitForElementVisible("//body", 500)

      // Start google signin process and switch to popup
      .click("//button[text()='Login']")
      .window_handles((result) => {
        client.switchWindow(result.value[1]);
      })
      .waitForElementVisible("//input[@type='email']", 500)

      // Fill in google username and password
      .setValue("//input[@type='email']", getArg("google-username"))
      .click("//input[@value='Next']")
      .waitForElementVisible("//input[@type='password']", 500)
      .setValue("//input[@type='password']", getArg("google-password"))
      .click("//input[@value='Sign in']")
      .pause(1000) // Wait for request to complete

      // Wait for signin to submit, then check if how many windows we have.
      // If two, we need to authorize the Google application and switch back to the main window.
      // If one, we're finished signing in, so we can just switch back to the main window immediately.
      .window_handles((result) => {
        if (result.value.length == 2) {
          client
            .waitForElementVisible("//button[@id='submit_approve_access']", 500)
            .click("//button[@id='submit_approve_access']")
            .switchWindow(result.value[0]);
        } else {
          client.switchWindow(result.value[0])
        }
      })

      // Test contact form creation
      .waitForElementVisible("//input[@placeholder='Contact Form Name']", 500)
      .setValue("//input[@placeholder='Contact Form Name']", generatedUuid)
      .setValue("//input[@placeholder='Contact Form Email']", "daniel@druskin.co")
      .click("//input[@type='submit']")

      // Verify success + new contact form shows up
      .waitForElementVisible(contactFormSuccessXpath, 30000)
      .waitForElementVisible(contactFormXpath, 30000)

      // Try sending a message to the new contact form
      .setValue(contactFormXpath + "//input[@placeholder='From']", "daniel@druskin.co")
      .setValue(contactFormXpath + "//input[@placeholder='Subject']", "Hello, world!")
      .setValue(contactFormXpath + "//textarea[@placeholder='Message']", "Hello, world!  What's up?")
      .click(contactFormXpath + "//input[@type='submit']")
      .waitForElementVisible(messageSuccessXpath, 30000)
      .end();
  }
};
