<template>
  <LegalPage title="Privacy notice">
    <div class="legal-callout">
      <p><strong>The short version:</strong> ollo is run by {{ controller }}. We use your data only to run your ollo page. We don't show ads, we don't sell or rent your data, and we don't use tracking or analytics cookies. You can delete your account and everything in it from your dashboard at any time.</p>
    </div>

    <h2>Who we are</h2>
    <p>{{ controller }} runs ollo (ollo.bio) and is the "controller" of your personal data under the UK GDPR and the EU GDPR. For anything about your data, contact us at <LegalContact />.</p>

    <h2>What we collect and why</h2>
    <table>
      <thead><tr><th>Data</th><th>Why we use it</th><th>Legal basis</th></tr></thead>
      <tbody>
        <tr><td>Your Discord account details when you sign in: Discord user ID, username, email address and profile picture</td><td>To create your account and sign you in</td><td>Contract: providing the service you signed up for</td></tr>
        <tr><td>What you add to your profile: username, display name, bio, avatar, background, social links, custom CSS and HTML, custom domain, PayPal, Pally and HypeRate details</td><td>To build and show your public ollo page</td><td>Contract</td></tr>
        <tr><td>Posts, replies and likes</td><td>To publish them and show them to other people</td><td>Contract</td></tr>
        <tr><td>Spotify access and refresh tokens, if you connect Spotify</td><td>To show what you're listening to on your page</td><td>Consent: you choose to connect it, and can disconnect at any time</td></tr>
        <tr><td>Video, audio and chat messages when you go live or join a live stream</td><td>To run live streaming and chat</td><td>Contract</td></tr>
        <tr><td>Sign-in records: IP address, browser details and times</td><td>To keep accounts secure and stop abuse</td><td>Legitimate interests: keeping ollo safe</td></tr>
      </tbody>
    </table>
    <p>Your profile, posts and links are public, because sharing them is what ollo is for. Don't put anything on your page that you don't want the world to see.</p>

    <h2>Showing your profile on ollo.thng.my</h2>
    <p>ollo.thng.my is a read-only list of ollo pages. You only appear there if you switch on <strong>Show my profile on ollo.thng.my</strong> under Privacy in your dashboard. It's off by default. If you do, it shows your username, display name, bio, avatar and links, based on your consent. Turn it off, or delete your account, and you'll be removed within about 6 hours.</p>

    <h2>Who else handles your data</h2>
    <p>We use a small number of services to run ollo. They only process your data to provide their service to us:</p>
    <ul>
      <li><strong>Supabase</strong>: our database, sign-in and file storage</li>
      <li><strong>Vercel</strong>: hosts the website and connects custom domains</li>
      <li><strong>Discord</strong>: lets you sign in. Discord's own privacy policy applies to your Discord account.</li>
      <li><strong>GetStream</strong>: live video and chat</li>
      <li><strong>Spotify</strong>: only if you connect it, to read what you're currently playing</li>
      <li><strong>Canny</strong>: shows our changelog on some pages, and may receive your IP address and browser details when it loads</li>
    </ul>
    <p>Some of these providers may process data outside the UK or EEA, for example in the United States. Where they do, we rely on the safeguards they offer, such as Standard Contractual Clauses. Contact us if you'd like details.</p>

    <h2>Cookies</h2>
    <p>We only use the cookies needed to keep you signed in. We don't use advertising or analytics cookies.</p>

    <h2>How long we keep it</h2>
    <ul>
      <li>Account, profile, posts, likes, links and Spotify tokens: until you delete them or delete your account</li>
      <li>Sign-in and security records: for as long as Supabase keeps them, which is a limited period</li>
      <li>Anything you made public may have been copied or saved by other people or by search engines before you deleted it. We can't control those copies.</li>
    </ul>

    <h2>Your rights</h2>
    <p>You have the right to:</p>
    <ul>
      <li>get a copy of your data. Your dashboard shows it under Privacy → Show user data.</li>
      <li>correct your data</li>
      <li>delete your data. Use Dashboard → Privacy → Delete user &amp; data, or ask us.</li>
      <li>restrict or object to how we use your data</li>
      <li>take your data to another service (data portability)</li>
      <li>withdraw consent at any time, for example by disconnecting Spotify. You can also remove ollo's access in your Spotify account settings.</li>
    </ul>
    <p>To use any of these rights, email <LegalContact />. We'll reply within one month. We don't make automated decisions about you that have legal or similarly significant effects.</p>

    <h2>Complaints</h2>
    <p>If you're unhappy with how we handle your data, please tell us first so we can fix it. You also have the right to complain to the data protection authority in the country where you live or work. In the UK, that's the Information Commissioner's Office (ico.org.uk).</p>

    <h2>Age</h2>
    <p>You must be at least 13 to use ollo, or older if the law in your country says so.</p>

    <h2>Changes</h2>
    <p>If we change this notice, we'll update the date at the top. If the change is significant, we'll also tell you on ollo.</p>
  </LegalPage>
</template>

<script setup lang="ts">
useHead({ title: 'Privacy · ollo' });
const controller = (useAppConfig().legal as { controller: string }).controller;
</script>
