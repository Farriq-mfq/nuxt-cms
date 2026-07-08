<script setup lang="ts">
definePageMeta({
    layout: 'admin'
})
const { loggedIn, user } = useUserSession()

</script>
<template>
    <div>
        Welcome Back
        <pre>{{ user }}</pre>
    </div>
</template>