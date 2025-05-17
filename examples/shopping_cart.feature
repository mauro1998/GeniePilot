Feature: Shopping Cart
  As a customer
  I want to manage items in my shopping cart
  So that I can purchase the right products

  Background:
    Given the online store is available
    And I am logged in as a registered customer

  Scenario: Add item to empty cart
    Given my shopping cart is empty
    When I view a product "Wireless Headphones"
    And I click "Add to Cart"
    Then the item should be added to my cart
    And my cart total should be updated to $99.99
    And I should see 1 item in my cart

  Scenario: Increase quantity of an item in cart
    Given I have 1 "Wireless Headphones" in my cart
    When I click the "+" button for that item
    Then the quantity should be increased to 2
    And my cart total should be updated to $199.98

  Scenario: Remove item from cart
    Given I have 1 "Wireless Headphones" in my cart
    When I click the "Remove" button for that item
    Then the item should be removed from my cart
    And my cart should be empty
    And my cart total should be $0.00

  @checkout
  Scenario: Proceed to checkout
    Given I have the following items in my cart:
      | Product              | Quantity | Price  |
      | Wireless Headphones  | 1        | $99.99 |
      | Phone Case           | 2        | $19.99 |
    When I click the "Proceed to Checkout" button
    Then I should be directed to the checkout page
    And I should see a summary of my order
    And the total should be $139.97

  Scenario Outline: Apply discount codes
    Given I have items worth $<initialTotal> in my cart
    When I apply the discount code "<code>"
    Then my cart total should be updated to $<finalTotal>

    Examples:
      | code      | initialTotal | finalTotal |
      | SAVE10    | 100.00       | 90.00      |
      | HALFOFF   | 100.00       | 50.00      |
      | FREESHIP  | 100.00       | 90.01      |
