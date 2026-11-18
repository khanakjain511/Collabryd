# Content strategy and implementation copy

All copy below is proposed for the intended product. Before release, confirm that each advertised capability is integrated; demo mode must use the explicit banner below. Use the brand spelling Collabyrd from the repository. The pasted brief sometimes says Collabryd; confirm branding before final asset export.

## Narrative

Recognition → useful product explanation → concrete workflow → trust boundaries → action. Use the campus and team-formation focus as the differentiator, rather than claiming novelty or superior algorithms. Do not invent students, endorsements, testimonials, usage totals, skill certification or guaranteed matches.

## Landing section messaging

| Section / objective | Concern and primary message | Proposed heading and supporting copy | Action | Visual / interaction |
| --- | --- | --- | --- | --- |
| Navigation / orientation | Where can I go? | Brand: Collabyrd. Links: How it works; Explore teams; Hackathons; FAQ. Account links: Log in; Find teammates | Find teammates → register for guest, discover for verified user | Sticky header, simple mobile menu |
| Hero / recognition | I have an idea but need people | **Find your people. Build your next idea.** "Meet students on your campus with the skills, interests, and availability to build a hackathon team together." | Find teammates; Explore hackathons | One team scene, fictional role cards, quiet network |
| Problem / relevance | My group chat isn't enough | **Your next teammate might be outside your group chat.** "Look beyond familiar names. See what people want to build, which roles teams need, and who is available to join." | See how it works → section anchor | Large readable text, fine divider; no pinning |
| Solution / understanding | What does this actually do? | **A clearer way to form a team.** "Create a profile, discover complementary skills, and keep every invitation and join request in one place." | Explore teams | Static product-demo cards, labeled examples |
| How it works / confidence | How much effort is joining? | **From profile to project team.** Steps: "Verify your campus"; "Share what you bring"; "Find a role or invite someone"; "Form a team and choose a hackathon" | Create your profile | Four numbered steps; subtle one-time reveals |
| Features / specificity | Can I find the right role? | **Know what a team needs before you join.** "Filter by skills, interests and availability. Read open roles, send a request, and follow its status." | Find an open role | Role/skill chips and request status preview |
| Use cases / relevance | Is this for someone like me? | **Bring an idea. Bring a skill. Bring your curiosity.** "Start a new team, fill a missing role, or join a group preparing for its next hackathon." | Explore teams | Three simple cards; no fabricated case studies |
| Events / opportunity | What can we build for? | **Find your next reason to build.** "Check hackathon dates, eligibility and team requirements. Follow the organizer's link for official registration." | Explore hackathons | Real approved listings only; otherwise explicitly fictional preview |
| Trust / privacy | Who can see my details? | **A campus community, with clear boundaries.** "Campus access is checked before private discovery. Skills are self-reported, and you control the profile details you share." | Read privacy information | Plain factual list; no certification badge |
| FAQ / objections | Eligibility, registration, matching | Use answers below | Register or support route | Native details/summary |
| Final CTA / next step | What should I do now? | **Your next team starts with a hello.** "Tell your campus what you want to build and what you can bring." | Find teammates | Deep teal panel and normal-flow footer |
| Footer / support | Can I learn more or get help? | "Collabyrd · Find people. Form teams. Build together." Links: About; Contact; Privacy; Terms | Appropriate actual routes | No dummy social links or institutional logos |

## Feature cards

- **Show what you bring.** "Share your skills, preferred roles and availability. Add portfolio links when you want to."
- **Discover beyond your circle.** "Find people and teams using the details that matter to your project."
- **Keep recruitment clear.** "See open roles, send invitations and track join-request decisions."
- **Build around a hackathon.** "Bring event dates, team requirements and official links into the same search."

## FAQ answers

- **Who can join?** "Collabyrd is designed to launch with one campus. You'll need to complete that campus's verification process before browsing its private community." Replace with actual campus policy when agreed.
- **Do I need to be an expert?** "Describe your experience honestly and look for a role that fits. Skills on profiles are self-reported."
- **Does joining a team register me for a hackathon?** "No. Follow the event organizer's official registration instructions. Linking a team to an event helps you organize your team here."
- **Does Collabyrd use AI to match people?** "The initial version uses profile information and filters to help you discover people and roles. AI matching is not part of the MVP."
- **Can I message teammates here?** "Direct and team chat are planned for a later phase. The initial release focuses on profiles, recruitment and notifications."
- **Can everyone see my profile?** "Private discovery is limited to eligible campus members. Your visibility options and the privacy notice explain what is shared." Final wording depends on agreed policy.

## Authentication copy

| Screen | Heading / introduction | Fields / actions | Feedback |
| --- | --- | --- | --- |
| Login | "Welcome back." / "Your next team is waiting to take shape." | Institution email; Password; Show password / Hide password; Log in; Forgot password?; New here? Create an account | Pending: "Signing in…"; credentials: "We couldn't sign you in with those details."; network: "Couldn't reach Collabyrd. Check your connection and try again." |
| Register | "Find your place on the team." / "Start with your institution email. We'll guide you through campus verification." | Name; Institution email; Password; Create account; Already have an account? Log in | Pending: "Creating your account…"; success only from service: "Check your email for the verification step."; unsupported: "This institution isn't enabled yet. Contact support to ask about access." |
| Verify | "Let's confirm your campus access." | Check email; Resend verification; Change email if supported; Log out | Pending review: "Your email is confirmed. Campus approval is still pending."; expiry: "This verification link has expired. Request a new one."; throttle: "You can request another link in {seconds} seconds." |
| Forgot password | "Reset your password." / "Enter your account email for the next step." | Email; Send reset link; Back to login | Generic response: "If an account uses that email, you'll receive reset instructions." |
| Reset password | "Choose a new password." | New password; Confirm password; Save password | Token failure: "This reset link is invalid or expired. Request a new one."; success: "Your password has been updated. Log in to continue." |

Never invent a password minimum or enrollment-domain rule. Show server-approved requirements before entry. Allow password managers and paste; correct autocomplete attributes are part of implementation. Do not promise email delivery from a mock service.

## Onboarding and application copy

- Onboarding: **"Help your campus find you."** "Add your academic details, skills and the roles you'd like to take. Optional links can wait." Steps: About you; Skills and interests; Roles and availability; Visibility and review. Buttons: Back; Continue; Skip optional details; Save profile. Confirmation: "Profile saved. You're ready to explore."
- Dashboard: **"Ready to find your next team, {firstName}?"** Next action: "Explore teams with open roles." When incomplete: "Add your skills to make your profile more useful."
- People: **"Find people to build with."** "Filter by skills, roles and availability." Actions: View profile; Invite to team. Detail note: "Skills are self-reported."
- Teams: **"Find a team that needs what you bring."** Actions: View team; Create team; Request to join. Request helper: "Tell the team which role interests you." Submit: Send request. Success: "Request sent. You can follow its status in My Teams."
- My Teams: **"Your teams and next steps."** Filters: Joined; Created; Invitations; Applications; Archived. Actions: Accept invitation; Decline; Cancel request.
- Leader review: **"Review join requests."** "Read the profile and role interest before deciding." Actions: Accept request; Decline request. Success: "Member added." only after accepted service response.
- Events: **"Find your next hackathon."** Actions: View event; Visit official registration; Find teams for this event. External notice: "Registration takes place on the organizer's website."
- Notifications: **"Your updates."** Empty: "You're all caught up. Invitations and request decisions will appear here." Action: Mark as read.
- Settings: **"Your profile. Your choices."** Sections: Profile; Account; Privacy; Notifications. Save: Save changes. Confirmation: Changes saved.
- Report: **"Report a concern."** "Tell the campus moderation team what happened. Include only relevant details." Fields: Reason; Details. Actions: Submit report; Cancel. Receipt: "Your report has been submitted for review." only from a real service.
- Admin: **"Campus review queue."** Filters: Verification; Events; Reports. Actions: Approve; Request more information; Publish event; Resolve report. Do not promise notices that the API does not send.

## State message library

| Situation | Copy / recovery |
| --- | --- |
| Demo banner | "Frontend demo · Example data only. No real accounts, requests or messages are sent." |
| Demo submit | "Demo complete. This action was shown locally; nothing was sent to a server." |
| No people | "No people match these filters yet." / Clear filters |
| No teams | "No teams match your search." / Clear filters or Create a team |
| No own teams | "Your first team is still ahead." / Explore teams |
| No events | "No published hackathons to show yet." / Check back later; no fabricated events |
| Loading | "Loading people…", "Loading teams…", "Loading event details…" |
| Required | "Enter your {field}." |
| Email format | "Enter an email address in the format name@institution.edu." (format example, not an approved campus domain) |
| URL format | "Enter a full https:// or http:// link." |
| Password mismatch | "The passwords don't match." |
| Duplicate application | "You already have a pending request for this team." / View My Teams |
| Team full | "This team filled its last place. Explore other teams with open roles." |
| Invitation expired | "This invitation has expired. Ask the team leader for a new invitation." |
| Generic load failure | "We couldn't load this page's data." / Try again |
| Session expired | "Your session has ended. Log in to continue." Preserve safe return path |
| Forbidden / hidden entity | "This content isn't available to your account." / Return to dashboard |
| Offline | "You're offline. Reconnect and try again." Keep input intact |
| Suspension | "This account can't access the campus community right now." / Contact support |

About page: "Collabyrd helps students on one campus discover collaborators and form hackathon teams." Contact, privacy and terms pages need real owner/contact/policy information. Do not publish invented contact addresses or a generated legal compliance claim. Their content remains an explicit release dependency.
