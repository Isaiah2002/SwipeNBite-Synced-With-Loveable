import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          <div className="space-y-8 pb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                SwipeN'Bite ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
              </p>
              <p className="text-muted-foreground">
                This policy complies with the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium mb-3 mt-4">2.1 Personal Information</h3>
              <p className="text-muted-foreground mb-3">We collect the following personal information:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
                <li><strong>Profile Information:</strong> Dietary preferences, favorite cuisines, food restrictions, and budget settings</li>
                <li><strong>Delivery Information:</strong> Address, city, state, and ZIP code for food delivery purposes</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-4">2.2 Location Data</h3>
              <p className="text-muted-foreground mb-3">
                With your explicit consent, we collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Real-time GPS location data for restaurant recommendations</li>
                <li>Location history to identify commute patterns and frequent areas</li>
                <li>Proximity data for geofencing notifications near favorite restaurants</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                <strong>You can disable location tracking at any time</strong> through your profile settings or device settings.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-4">2.3 Usage Data</h3>
              <p className="text-muted-foreground mb-3">We automatically collect:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Swipe events (restaurants liked or passed)</li>
                <li>Order history and purchase patterns</li>
                <li>App usage statistics and feature interactions</li>
                <li>Device information (device type, operating system, browser type)</li>
                <li>IP address and general geographic location</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-4">2.4 Cookies and Tracking</h3>
              <p className="text-muted-foreground">
                We use local storage and cookies to remember your preferences, maintain your session, and improve app performance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">We use collected information for:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Service Delivery:</strong> Process orders, provide restaurant recommendations, and deliver requested services</li>
                <li><strong>Personalization:</strong> Customize restaurant suggestions based on preferences, location, and behavior</li>
                <li><strong>Analytics:</strong> Analyze usage patterns to improve features and user experience (with your consent)</li>
                <li><strong>Notifications:</strong> Send relevant alerts about orders, favorite restaurants, and personalized suggestions (with your consent)</li>
                <li><strong>Budget Management:</strong> Track spending and provide budget alerts</li>
                <li><strong>Communication:</strong> Respond to inquiries and provide customer support</li>
                <li><strong>Security:</strong> Detect fraud, prevent abuse, and protect user accounts</li>
                <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Legal Basis for Processing (GDPR)</h2>
              <p className="text-muted-foreground mb-3">We process your data based on:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Consent:</strong> Location tracking, analytics, and notifications require explicit opt-in consent</li>
                <li><strong>Contract Performance:</strong> Processing orders and providing core services</li>
                <li><strong>Legitimate Interests:</strong> Improving services, fraud prevention, and security</li>
                <li><strong>Legal Obligation:</strong> Compliance with applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-medium mb-3 mt-4">5.1 Third-Party Services</h3>
              <p className="text-muted-foreground mb-3">We share data with:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Restaurant Data Providers:</strong> Yelp, OpenTable, Documenu for restaurant information</li>
                <li><strong>Mapping Services:</strong> OpenStreetMap for geocoding and location services</li>
                <li><strong>Analytics Providers:</strong> Service analytics (only with your consent)</li>
                <li><strong>Cloud Infrastructure:</strong> Supabase for secure data storage and authentication</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-4">5.2 When Required by Law</h3>
              <p className="text-muted-foreground">
                We may disclose information to comply with legal obligations, court orders, or government requests.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-4">5.3 Business Transfers</h3>
              <p className="text-muted-foreground">
                In the event of a merger, acquisition, or sale of assets, your data may be transferred to the new entity.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-4">5.4 No Sale of Personal Data</h3>
              <p className="text-muted-foreground">
                <strong>We do not sell your personal information to third parties.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
              
              <h3 className="text-xl font-medium mb-3 mt-4">6.1 GDPR Rights (EU Users)</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to data processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Revoke consent for location, analytics, or notifications at any time</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-4">6.2 CCPA Rights (California Users)</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Right to Know:</strong> Request information about data collection and use</li>
                <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
                <li><strong>Right to Opt-Out:</strong> Opt out of data "sales" (note: we do not sell data)</li>
                <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-4">6.3 How to Exercise Your Rights</h3>
              <p className="text-muted-foreground mb-3">
                You can exercise these rights through:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Privacy Dashboard in your Profile settings</li>
                <li>Export your data in JSON or CSV format</li>
                <li>Delete specific data categories or all activity data</li>
                <li>Update consent preferences at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
              <p className="text-muted-foreground mb-3">
                We implement industry-standard security measures including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Encryption of data at rest</li>
                <li>Secure authentication with password hashing</li>
                <li>Row-level security policies for database access</li>
                <li>Regular security audits and updates</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
              <p className="text-muted-foreground mb-3">We retain your data:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Account Data:</strong> Until you delete your account or request deletion</li>
                <li><strong>Order History:</strong> For 7 years for accounting and legal purposes</li>
                <li><strong>Location History:</strong> Until you request deletion or disable tracking</li>
                <li><strong>Analytics Data:</strong> Aggregated and anonymized after 24 months</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our service is not intended for users under 18 years of age. We do not knowingly collect information from children. If you believe we have collected data from a minor, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your data may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards are in place through standard contractual clauses and compliance with applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy periodically. Material changes will be notified through the app or email. Continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground mb-3">
                For privacy-related questions, concerns, or to exercise your rights:
              </p>
              <ul className="list-none space-y-2 text-muted-foreground">
                <li><strong>Email:</strong> privacy@swipenbite.com</li>
                <li><strong>In-App:</strong> Profile → Privacy Dashboard</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                <strong>Data Protection Officer (EU):</strong> dpo@swipenbite.com
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>CCPA Inquiries (California):</strong> ccpa@swipenbite.com
              </p>
            </section>

            <section className="border-t pt-6">
              <p className="text-sm text-muted-foreground italic">
                By using SwipeN'Bite, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
              </p>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
