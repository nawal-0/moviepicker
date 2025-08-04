# 5. Navigation Flow Restructuring

**Date:** 27-05-2025

**Status:** Accepted

## Summary

In the context of improving user onboarding and reducing navigation confusion, facing a critical UX issue where login redirected directly to session creation with join functionality buried in an illogical flow, we decided to implement a dedicated Home screen with clear "Create Group Session" and "Join Group Session" options, to achieve intuitive user flow and reduced cognitive load, accepting additional routing complexity and an extra navigation step.

## Context

• Users reported confusion with the existing navigation flow: Login → CreateSession → Join (via "start swiping" button)
• The join session functionality was only accessible after users clicked "start swiping" from the create session screen, which was counterintuitive
• Users wanting to join an existing session were forced through the session creation interface first
• The CreateSession.js component contained mixed responsibilities for both creating and joining sessions
• User experience testing revealed the flow violated standard UX principles of clear user intent separation
• The existing flow created unnecessary friction for users with different goals (create vs join)

## Decision

Restructure the navigation flow to include a dedicated Home screen that clearly separates user intentions:

**New Flow:** Login → Home → Create/Join → Swiping

**Implementation Details:**
• Create a new Home.js component with two primary action buttons: "Create Group Session" and "Join Group Session"
• Update App.js routing to include the Home screen as an intermediate step after login
• Modify CreateSession.js to focus solely on session creation, removing join group integration
• Update JoinGroup.js to handle proper navigation callbacks
• Ensure consistent navigation patterns throughout the application

The Home screen serves as a clear decision point where users can choose their intended action without confusion.

## Consequences

**Advantages:**
• Clear separation of user intentions (create vs join) reduces cognitive load
• Improved user onboarding experience with logical flow progression
• Better adherence to UX best practices for navigation design
• Reduced user confusion and support requests related to navigation
• Each component now has a single, clear responsibility
• Easier to maintain and extend individual flows in the future

**Neutral:**
• Additional screen in the user journey adds one more navigation step
• Slightly increased routing complexity in App.js
• Additional component to maintain (Home.js)

**Disadvantages:**
• Users must make an additional click/selection before reaching their destination
• Slightly longer path for users who know exactly what they want to do
• Requires updates to any existing user documentation or tutorials 