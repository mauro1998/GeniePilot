Feature: Student Registration Form Submission

  Scenario: User submits the form without entering any information
    Given the user is on the Practice Form page
    And the "Student Registration Form" is visible
    When the user clicks the "Submit" button
    Then the form should display validation errors for the following required fields:
      | Field             |
      | First Name        |
      | Last Name         |
      | Email             |
      | Mobile (10 Digits)|

  Scenario: User enters email and address but skips all required fields
    Given the user is on the Practice Form page
    And the "Email" field is pre-filled with "name@example.com"
    And the "Current Address" field is filled with "Current Address"
    When the user clicks the "Submit" button
    Then the form should display validation errors for the following required fields:
      | Field             |
      | First Name        |
      | Last Name         |
      | Mobile (10 Digits)|

  Scenario: User provides invalid email and tries to submit
    Given the user is on the Practice Form page
    And the user enters "not-an-email" into the "Email" field
    And leaves all other fields empty
    When the user clicks the "Submit" button
    Then a validation error should be shown for the "Email" field
    And the following fields should also show required field errors:
      | Field             |
      | First Name        |
      | Last Name         |
      | Mobile (10 Digits)|

  Scenario: User enters fewer than 10 digits in Mobile field and submits
    Given the user is on the Practice Form page
    And the user enters "12345" into the "Mobile (10 Digits)" field
    When the user clicks the "Submit" button
    Then a validation error should be shown for the "Mobile (10 Digits)" field

  Scenario: User skips gender selection and submits
    Given the user has filled all required fields except for gender selection
    When the user clicks the "Submit" button
    Then the form should submit successfully
    But the gender field should remain unselected

  Scenario: User enters only whitespace in required fields
    Given the user enters " " (a space) into the "First Name" field
    And the user enters " " (a space) into the "Last Name" field
    And the user enters " " (a space) into the "Mobile (10 Digits)" field
    And the user enters " " (a space) into the "Email" field
    When the user clicks the "Submit" button
    Then the form should display validation errors indicating fields cannot be blank

  Scenario: User submits valid Date of Birth but leaves other required fields empty
    Given the "Date of Birth" field is pre-filled with "17 May 2025"
    And all other required fields are empty
    When the user clicks the "Submit" button
    Then validation errors should appear for the following fields:
      | Field             |
      | First Name        |
      | Last Name         |
      | Email             |
      | Mobile (10 Digits)|
