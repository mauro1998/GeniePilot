Feature: User Authentication
  As a user
  I want to authenticate with the system
  So that I can access protected resources

  Background:
    Given the application is running
    And I am on the login page

  Scenario: Successful login with valid credentials
    When I enter valid username "user@example.com"
    And I enter valid password "Password123"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message with my username

  Scenario: Failed login with invalid credentials
    When I enter invalid username "invalid@example.com"
    And I enter invalid password "WrongPassword"
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page

  Scenario: Password reset request
    When I click on the "Forgot Password" link
    Then I should be redirected to the password reset page
    When I enter my registered email "user@example.com"
    And I click the "Reset Password" button
    Then I should see a confirmation message
    And a password reset email should be sent to "user@example.com"

  @security @logout
  Scenario: Automatic logout after inactivity
    Given I am logged in as "user@example.com"
    When I remain inactive for 30 minutes
    Then I should be automatically logged out
    And I should be redirected to the login page
    And I should see a message "You have been logged out due to inactivity"
