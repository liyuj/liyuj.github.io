<template>
    <section v-show="isActive"
             :aria-hidden="! isActive"
             class="tabs-component-panel"
             :id="computedId"
             role="tabpanel"
    >
        <slot />
    </section>
</template>

<script>
    export default {
        name : 'Tab',
        props: {
            id: { default: null },
            title: { required: true },
            prefix: { default: '' },
            suffix: { default: '' }            
        },

        data: () => ({
            isActive: false
        }),

        computed: {
            header() {
                return this.prefix + this.title + this.suffix;
            },

            computedId() {
                return this.id ? this.id : this.title.toLowerCase().replace(/ /g, '-');
            },

            hash() {
                return '#' + this.computedId;
            },
        },
    };
</script>
