import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
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
              <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing or using SwipeN'Bite ("Service," "App," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className="text-muted-foreground">
                These Terms constitute a legally binding agreement between you and SwipeN'Bite.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                SwipeN'Bite is a restaurant discovery and food ordering platform that provides:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Personalized restaurant recommendations based on preferences and location</li>
                <li>Interactive swipe-based restaurant browsing experience</li>
                <li>Menu viewing and food ordering capabilities</li>
                <li>Budget tracking and spending analytics</li>
                <li>Location-based notifications and proximity alerts</li>
                <li>Order history and favorite restaurant management</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-medium mb-3 mt-4">3.1 Account Creation</h3>
              <p className="text-muted-foreground mb-3">
                To use certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-4">3.2 Eligibility</h3>
              <p className="text-muted-foreground">
                You must be at least 18 years old to use this Service. By using the Service, you represent and warrant that you meet this requirement.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-4">3.3 Account Termination</h3>
              <p className="text-muted-foreground">
                We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or any other reason at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
              <p className="text-muted-foreground mb-3">You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Violate or infringe upon the rights of others</li>
                <li>Upload or transmit viruses, malware, or harmful code</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Collect or harvest data from the Service through automated means</li>
                <li>Impersonate any person or entity</li>
                <li>Use the Service to spam, harass, or abuse others</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Orders and Payments</h2>
              
              <h3 className="text-xl font-medium mb-3 mt-4">5.1 Order Placement</h3>
              <p className="text-muted-foreground mb-3">
                When you place an order through the Service:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You are making an offer to purchase the items at the displayed prices</li>
                <li>All orders are subject to acceptance by the restaurant</li>
                <li>We reserve the right to refuse or cancel any order</li>
                <li>Prices, availability, and menu items may change without notice</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-4">5.2 Payment</h3>
              <p className="text-muted-foreground mb-3">
                Payment processing is handled by third-party payment processors. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide valid payment information</li>
                <li>Pay all charges incurred by you or on your account</li>
                <li>Be responsible for all applicable taxes and fees</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-4">5.3 Refunds and Cancellations</h3>
              <p className="text-muted-foreground">
                Refund and cancellation policies are determined by individual restaurants. Contact customer support for assistance with order issues.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Location Services</h2>
              <p className="text-muted-foreground mb-3">
                Our Service uses location data to provide personalized recommendations. By enabling location services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You consent to collection and use of your location data as described in our Privacy Policy</li>
                <li>You understand location accuracy may vary based on device and signal strength</li>
                <li>You can disable location services at any time through your device or app settings</li>
                <li>Some features may be limited or unavailable without location access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
              
              <h3 className="text-xl font-medium mb-3 mt-4">7.1 Our Content</h3>
              <p className="text-muted-foreground mb-3">
                The Service and its original content, features, and functionality are owned by SwipeN'Bite and are protected by international copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-4">7.2 User Content</h3>
              <p className="text-muted-foreground mb-3">
                By using the Service, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display any content you submit for the purpose of providing the Service.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-4">7.3 Third-Party Content</h3>
              <p className="text-muted-foreground">
                Restaurant information, images, and reviews are provided by third parties (Yelp, OpenTable, Google Maps). We do not guarantee accuracy, completeness, or quality of third-party content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Disclaimers</h2>
              
              <h3 className="text-xl font-medium mb-3 mt-4">8.1 Service "As Is"</h3>
              <p className="text-muted-foreground mb-3">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
                <li>Warranties regarding accuracy, reliability, or quality of the Service</li>
                <li>Warranties that the Service will be uninterrupted, secure, or error-free</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-4">8.2 Restaurant Responsibility</h3>
              <p className="text-muted-foreground">
                SwipeN'Bite acts as a platform connecting users with restaurants. We are not responsible for food quality, preparation, delivery, or any issues arising from restaurant services.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-4">8.3 No Medical Advice</h3>
              <p className="text-muted-foreground">
                Dietary and nutritional information is provided for convenience only and should not be considered medical advice. Consult a healthcare professional for dietary concerns or allergies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-3">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SWIPENBITE SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or use</li>
                <li>Damages arising from your use or inability to use the Service</li>
                <li>Issues related to food quality, allergic reactions, or health concerns</li>
                <li>Delivery delays, errors, or problems caused by restaurants or third parties</li>
                <li>Unauthorized access to your account or data</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to indemnify, defend, and hold harmless SwipeN'Bite and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including attorney fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Any content you submit or transmit through the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Dispute Resolution</h2>
              
              <h3 className="text-xl font-medium mb-3 mt-4">11.1 Informal Resolution</h3>
              <p className="text-muted-foreground">
                Before filing a claim, you agree to try to resolve the dispute informally by contacting support@swipenbite.com.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-4">11.2 Arbitration</h3>
              <p className="text-muted-foreground mb-3">
                Any disputes arising from these Terms or the Service shall be resolved through binding arbitration rather than in court, except:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Small claims court disputes</li>
                <li>Intellectual property disputes</li>
                <li>Cases where arbitration is prohibited by law</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-4">11.3 Class Action Waiver</h3>
              <p className="text-muted-foreground">
                You agree to resolve disputes individually. You waive the right to participate in class actions, class arbitrations, or representative actions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. Material changes will be notified through the app or email. Your continued use after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Termination</h2>
              <p className="text-muted-foreground mb-3">
                You may terminate your account at any time through the app settings. We may terminate or suspend access immediately without prior notice for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Extended periods of inactivity</li>
                <li>Any other reason at our discretion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Severability</h2>
              <p className="text-muted-foreground">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">16. Contact Information</h2>
              <p className="text-muted-foreground mb-3">
                For questions about these Terms:
              </p>
              <ul className="list-none space-y-2 text-muted-foreground">
                <li><strong>Email:</strong> legal@swipenbite.com</li>
                <li><strong>Support:</strong> support@swipenbite.com</li>
              </ul>
            </section>

            <section className="border-t pt-6">
              <p className="text-sm text-muted-foreground italic">
                By using SwipeN'Bite, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
