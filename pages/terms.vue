<template>
  <LegalPage title="Terms of use">
    <div class="legal-callout">
      <p><strong>The short version:</strong> ollo is free and open-source. Be decent, only post what you have the right to post, and you can leave whenever you like.</p>
    </div>

    <h2>Who we are</h2>
    <p>ollo (ollo.bio) is run by {{ controller }}. These terms apply when you use ollo. To contact us, email <LegalContact />.</p>

    <h2>Your account</h2>
    <ul>
      <li>You sign in with Discord. You're responsible for what happens on your account, so keep your Discord login secure.</li>
      <li>You must be at least 13, or older if the law in your country says so.</li>
      <li>Usernames are first come, first served. We may take back a username that impersonates someone, infringes a trademark or has been left unused for a long time.</li>
    </ul>

    <h2>Your content</h2>
    <ul>
      <li>You keep ownership of everything you post.</li>
      <li>You give us permission to store your content and show it on ollo, only so that we can run the service. That permission ends when you delete the content or your account.</li>
      <li>Only post content you have the right to share.</li>
    </ul>

    <h2>Don't</h2>
    <ul>
      <li>post anything illegal, hateful, harassing or sexually explicit, or anything that exploits children</li>
      <li>impersonate other people or mislead people about who you are</li>
      <li>use custom CSS, HTML or links for phishing, malware or tricking visitors</li>
      <li>spam, scrape ollo at scale, or try to break or overload the service</li>
    </ul>
    <p>We may remove content or suspend accounts that break these rules. Where it's safe to do so, we'll tell you why.</p>

    <h2>Leaving</h2>
    <p>You can delete your account at any time from Dashboard → Privacy. This deletes your profile, posts, likes, links and uploads, as described in our <NuxtLink to="/privacy">privacy notice</NuxtLink>.</p>

    <h2>Open source</h2>
    <p>ollo's code is available under the MIT licence. These terms cover use of the hosted service at ollo.bio, not your use of the code.</p>

    <h2>No guarantees</h2>
    <p>ollo is a free service run by a collective. We provide it "as is", without warranties, and may change or stop features. As far as the law allows, we aren't liable for indirect losses, or for losses caused by outside services such as Discord, Spotify or GetStream. Nothing in these terms limits rights you have under consumer law.</p>

    <h2>Changes</h2>
    <p>If we change these terms, we'll update the date at the top. If the change is significant, we'll also tell you on ollo. If you keep using ollo after a change, you accept the updated terms.</p>
  </LegalPage>
</template>

<script setup lang="ts">
useHead({ title: 'Terms · ollo' });
const controller = (useAppConfig().legal as { controller: string }).controller;
</script>
