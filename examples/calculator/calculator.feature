Feature: Calculator Application

  Scenario: User performs addition
    Given the calculator is open
    When the user presses "Seven"
    And the user presses "Plus"
    And the user presses "Three"
    And the user presses "Equals"
    Then the display should show "10"

  Scenario: User performs subtraction
    Given the calculator is open
    When the user presses "Nine"
    And the user presses "Minus"
    And the user presses "Four"
    And the user presses "Equals"
    Then the display should show "5"

  Scenario: User performs multiplication
    Given the calculator is open
    When the user presses "Eight"
    And the user presses "Multiply"
    And the user presses "Two"
    And the user presses "Equals"
    Then the display should show "16"

  Scenario: User performs division
    Given the calculator is open
    When the user presses "Sixteen"
    And the user presses "Divide"
    And the user presses "Four"
    And the user presses "Equals"
    Then the display should show "4"

  Scenario: User presses the All Clear button
    Given the calculator displays "1500"
    When the user presses "All Clear"
    Then the display should show "0"

  Scenario: User tries to divide by zero
    Given the calculator is open
    When the user presses "Five"
    And the user presses "Divide"
    And the user presses "Zero"
    And the user presses "Equals"
    Then the display should show "Error"

  Scenario: User tries to calculate with empty inputs
    Given the calculator is open
    When the user presses "Equals"
    Then the display should show "Error"

  Scenario: User performs a large number calculation
    Given the calculator is open
    When the user presses "One"
    And the user presses "Zero" five times
    And the user presses "Plus"
    And the user presses "One"
    And the user presses "Equals"
    Then the display should show "1000001"

  Scenario: User toggles the Plus Minus button
    Given the calculator is open
    When the user presses "Five"
    And the user presses "Plus Minus"
    Then the display should show "-5"
