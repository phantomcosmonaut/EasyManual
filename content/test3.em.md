@Category[New Deal 2]
@Name[Auto Lead Form]

# Auto Lead Form

This form was designed to require only the most essential rating factors to speed up the rating process for insurance agents. These factors were determined by underwriting and insurops.

Submitting this form will create a new consumer or edit an existing one, request a risk report from our vendor, and send that information to our rating engine to be rated. We tag this rating request as **High Confidence** which our rating engine treats differently than deals that are rated from other parts of our system such as Polly for Dealers. This makes possible things like coverage overrides.

The form is broken down into the following sections:

## Consumer

Basic contact information for the primary insured.

## Address

Mailing and garaging addresses can be entered. We use a service to search registered addresses when typing in the main address field. Selecting a choice will prefill the rest of the address. Checking the box marked _Mailing address is garaging address_ will save two identical addresses under both types.

## Vendor Data

We pay third party vendors for additional information about consumers that can be used as prefill for this form. This information includes, but is not limited to:
- Related drivers
- Registered Vehicles
- Drivers license information
- Risk report scores

When vendors return information about a consumer, options will be available for the user to select that piece of data and prefill sections of the form. For example a found driver can be selected and that creates and prefills a new driver.

## Drivers

Drivers and incidents (Insurance claims/moving violations) can be entered here. Some fields for the primary driver are controlled by the consumer section. Excluding a driver adds them to the policy without providing them coverage.

## Vehicles

Another place where vendor prefill options will appear. We use a service to gather vehicle information when a vin is entered. Vin is optional. Selecting _Any vehicles used for Ride Share_ will mark all vehicles on the policy as being used for ride share (eg. Uber, Lyft).

## Current Insurance

The consumer's current active insurance policy.

## Coverages

Allows the user to select a coverage package and override that package's default values. Coverage packages are created in COT and contain all the necessary coverages for a state. Override options are also configured in COT on a per state basis and include only the most common values.

## Discounts

Carriers do not all share/support the same discount options, but our rating engine has consolidated most options into a standardized list that we expose here.