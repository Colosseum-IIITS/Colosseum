# Colosseum E-Sports Platform - Process Flow Diagram Context

## Overview
This document provides comprehensive context for creating the Process Flow Diagram for the Colosseum E-Sports Tournament Hosting Platform. The diagram should capture all business processes, decision points, and system interactions.

---

## Platform Summary
**Colosseum** is a full-stack e-sports tournament hosting platform that enables:
- **Players** to register, form teams, join tournaments, and track rankings
- **Organisers** to create tournaments, manage teams, and view analytics
- **Admins** to moderate content, approve tournaments, and enforce bans

---

## Actors/Entities

### 1. Player
- Registers/Logs in with JWT authentication
- Creates or joins teams (requires payment for team creation)
- Follows organisers to receive notifications
- Registers team for tournaments (pays entry fee)
- Reports teams or organisers for misconduct
- Views global rankings and tournament results

### 2. Organiser
- Registers/Logs in with JWT authentication
- Creates tournaments (requires admin approval)
- Updates points table during tournaments
- Declares winner and completes tournaments
- Bans teams from their tournaments
- Reports other organisers
- Manages profile visibility settings

### 3. Admin
- Logs in with special admin credentials
- Views admin dashboard with statistics
- Approves/Rejects pending tournaments
- Bans/Unbans players, teams, and organisers
- Reviews and resolves reports
- Deletes users and tournaments

### 4. External Systems
- **Stripe API**: Payment processing for team creation and tournament entry fees
- **Email Service (Nodemailer)**: Welcome emails, notifications
- **Redis Cache**: Performance optimization, data caching
- **MongoDB**: Primary database for all entities

---

## Core Process Flows

### Process 1: User Authentication Flow
**Trigger**: User visits login/registration page

1. User enters credentials (email, password)
2. **Decision**: New user or existing?
   - **New User**: 
     - Validate unique email/username
     - Hash password with bcrypt
     - Store user in database
     - Send welcome email via Nodemailer
     - Generate JWT token
   - **Existing User**:
     - Validate credentials against stored hash
     - **Decision**: Credentials valid?
       - **Yes**: Generate JWT token, return to user
       - **No**: Return error message
3. Store token in client (cookie/localStorage)
4. Redirect to role-appropriate dashboard

### Process 2: Tournament Creation & Approval Flow
**Trigger**: Organiser clicks "Create Tournament"

1. Organiser fills tournament form (tid, name, dates, entryFee, prizePool, description)
2. **Decision**: Valid tournament ID?
   - **No**: Return error "Tournament ID already exists"
   - **Yes**: Continue
3. **Decision**: Valid date range (start < end)?
   - **No**: Return error
   - **Yes**: Continue
4. Save tournament with status = "Pending"
5. Link tournament to organiser's tournaments array
6. Notify followers via pub-sub system (push notification to each following player)
7. Invalidate organiser profile cache
8. Tournament appears in Admin dashboard for review
9. Admin reviews tournament details
10. **Decision**: Approve or Reject?
    - **Approve**: 
      - Update status to "Approved"
      - Invalidate tournament cache
      - Tournament becomes visible to players
    - **Reject**: 
      - Update status to "Rejected" or delete
      - Notify organiser

### Process 3: Team Creation & Payment Flow
**Trigger**: Player clicks "Create Team"

1. **Decision**: Has player already paid team creation fee?
   - **Yes**: Skip to step 7
   - **No**: Continue payment flow
2. Display payment form (Stripe Elements)
3. Create Payment Intent via Stripe API
4. Save payment record in database (status: pending)
5. Player completes payment in Stripe
6. **Decision**: Payment successful?
   - **No**: Return error, payment remains pending
   - **Yes**: 
     - Update payment status to "completed"
     - Update player.teamPayment = { paid: true, payment: paymentId }
     - Invalidate player profile cache
7. Player enters team details (name, logo)
8. Create team in database
9. Set player as captain
10. Link team to player's profile
11. Return success, redirect to team dashboard

### Process 4: Join Team Request Flow
**Trigger**: Player clicks "Request to Join Team"

1. Player searches for team
2. Player sends join request
3. **Decision**: Player already in a team?
   - **Yes**: Return error "Must leave current team first"
   - **No**: Continue
4. Add player ID to team's joinRequests array
5. Notify team captain (push to captain's notifications)
6. Captain views join requests
7. **Decision**: Captain approves or rejects?
   - **Approve**:
     - Add player to team.players array
     - Update player.team reference
     - Remove from joinRequests
     - Notify player of acceptance
   - **Reject**:
     - Remove from joinRequests
     - Notify player of rejection

### Process 5: Tournament Registration Flow
**Trigger**: Team captain registers for tournament

1. Captain views available tournaments (status: Approved)
2. Captain selects tournament
3. **Decision**: Team already registered?
   - **Yes**: Show "Already registered"
   - **No**: Continue
4. Display entry fee payment form
5. Process payment via Stripe
6. **Decision**: Payment successful?
   - **No**: Return error
   - **Yes**: Continue
7. Add team to tournament.teams array
8. Add tournament to player.tournaments for each team member
9. Update organiser.totalRevenue += entryFee
10. Invalidate tournament cache
11. Notify team members of successful registration

### Process 6: Tournament Execution Flow
**Trigger**: Tournament start date reached

1. Organiser monitors tournament progress
2. During tournament:
   - Organiser updates points table (match results)
   - System updates tournament.pointsTable
   - Invalidate tournament cache for real-time updates
3. Tournament reaches completion:
   - Organiser marks tournament as "Completed"
   - Organiser declares winning team
4. **Decision**: Winner declared?
   - **Yes**:
     - Update tournament.winner = winningTeamId
     - For each player in winning team:
       - Find tournament in player.tournaments
       - Set won = true
     - Recalculate global rankings
     - Invalidate rankings cache
     - Notify all participants of results
   - **No**: 
     - Tournament remains in progress

### Process 7: Reporting & Moderation Flow
**Trigger**: User reports team or organiser

1. **Report Submission**:
   - Player reports Team OR Organiser
   - Organiser can also report other Organisers
   - Store report (reportedBy, reportType, reason, status: Pending)

2. **Report Review (Admin/Organiser)**:
   - For Team reports: Organiser can view and ban team from their tournaments
   - For Organiser reports: Only Admin can review
   - Admin views all pending reports

3. **Decision**: Admin action required?
   - **Review Report**:
     - Update report status to "Reviewed"
   - **Ban Entity**:
     - Create BanHistory record (entityType, reason, active: true)
     - Update user.banned = true
     - Block login access
     - Notify banned user
   - **Unban Entity**:
     - Update BanHistory.active = false
     - Update user.banned = false
     - Restore access

### Process 8: Follow/Notification Flow
**Trigger**: Player follows organiser

1. Player views organiser profile
2. Player clicks "Follow"
3. Add player ID to organiser.followers array
4. Add organiser ID to player.following array
5. **Future Event**: Organiser creates tournament
6. System queries all players in organiser.followers
7. For each follower:
   - Push notification message to player.notifications array
8. Player views notifications
9. Player can click notification to view tournament

### Process 9: Admin Dashboard Flow
**Trigger**: Admin logs in

1. Admin authenticated via special admin auth route
2. Dashboard displays:
   - Total players count
   - Total organisers count
   - Total tournaments (by status)
   - Pending reports
   - Recent ban history
3. Admin actions available:
   - Approve/Reject tournaments
   - Ban/Unban users
   - Delete users or tournaments
   - Review reports

---

## Data Stores (MongoDB Collections)

| Collection | Key Fields |
|------------|------------|
| Players | _id, username, email, password, team, following, tournaments[], notifications[], banned, teamPayment |
| Organisers | _id, username, email, password, followers[], tournaments[], bannedTeams[], totalRevenue, visibilitySettings, banned |
| Admins | _id, username, email, password |
| Teams | _id, name, logo, players[], captain, tournaments[], joinRequests[] |
| Tournaments | _id, tid, name, startDate, endDate, entryFee, prizePool, status, organiser, teams[], winner, pointsTable |
| Payments | _id, player, amount, type, status, stripePaymentId |
| Reports | _id, reportedBy, reportType, reportedTeam/reportedOrganiser, reason, status |
| BanHistory | _id, bannedEntity, entityType, reason, bannedAt, active |

---

## Decision Points Summary

| Process | Decision | Outcomes |
|---------|----------|----------|
| Authentication | Valid credentials? | Success → JWT Token / Fail → Error |
| Authentication | New or existing user? | Register flow / Login flow |
| Tournament Creation | Valid TID? | Continue / Error |
| Tournament Creation | Valid dates? | Continue / Error |
| Tournament Approval | Approve/Reject? | Approved → Visible / Rejected → Hidden |
| Team Creation | Already paid? | Skip payment / Process payment |
| Payment | Successful? | Continue / Error |
| Join Request | In another team? | Error / Allow request |
| Join Request | Captain decision? | Accept → Add to team / Reject → Remove request |
| Tournament Registration | Already registered? | Error / Allow registration |
| Tournament Completion | Winner declared? | Update rankings / Keep in progress |
| Report Action | Ban required? | Create ban record / Just review |
| User Access | Banned? | Block access / Allow access |

---

## System States

### Tournament Status
- **Pending**: Awaiting admin approval
- **Approved**: Visible to players, registration open
- **In Progress**: Tournament started (implicit by date)
- **Completed**: Winner declared, closed

### Payment Status
- **pending**: Payment initiated
- **completed**: Payment confirmed

### Report Status
- **Pending**: Awaiting review
- **Reviewed**: Processed by admin/organiser

### Ban Status
- **active: true**: Currently banned
- **active: false**: Previously banned, now unbanned

---

## External API Interactions

### Stripe Payment Flow
1. Frontend calls backend `/payment/create-intent`
2. Backend creates PaymentIntent via Stripe SDK
3. Backend returns clientSecret to frontend
4. Frontend uses Stripe Elements to complete payment
5. On success, frontend calls `/payment/confirm`
6. Backend verifies with Stripe, updates database

### Email (Nodemailer) Triggers
- User registration (welcome email)
- Tournament approval/rejection
- Ban/Unban notifications
- Join request acceptance/rejection

### Redis Cache Operations
- **GET**: Check cache before database query
- **SET**: Cache data after database fetch
- **DEL**: Invalidate on data update (profile changes, tournament updates, rankings)

---

## Process Flow Diagram Requirements

The diagram should show:
1. **Start/End nodes** (circles)
2. **Process steps** (rounded rectangles)
3. **Decision points** (diamonds)
4. **Parallel processes** (horizontal bars for fork/join)
5. **Swim lanes optional** - but flows should be clear
6. **Sub-processes** for complex flows (e.g., Payment)
7. **System interactions** (database, cache, external APIs)

### Recommended Sections
1. **Authentication Process**
2. **Tournament Lifecycle** (Creation → Approval → Execution → Completion)
3. **Team Management** (Creation → Join Requests → Registration)
4. **Payment Processing** (as sub-process)
5. **Reporting & Moderation**
6. **Notification System**

---

## Color Coding (Consistent with other diagrams)

| Element | Color |
|---------|-------|
| Player actions | Blue (#dae8fc) |
| Organiser actions | Green (#d5e8d4) |
| Admin actions | Orange (#ffe6cc) |
| System/Backend | Red (#f8cecc) |
| External Services | Purple (#e1d5e7) |
| Database | Gray (#f5f5f5) |
| Decision points | Yellow (#fff2cc) |
| Report/Ban related | Light Red (#f8cecc with #b85450 border) |
