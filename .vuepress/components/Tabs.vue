<template>
    <div class="tabs-component">
        <ul role="tablist" class="tabs-component-tabs">
            <li
                v-for="(tab, i) in tabs"
                :key="i"
                :class="{ 'is-active': tab.isActive }"
                class="tabs-component-tab"
                role="presentation"
            >
                <a v-html="tab.header"
                   :aria-controls="tab.hash"
                   :aria-selected="tab.isActive"
                   @click="selectTab(tab.hash, $event)"
                   class="tabs-component-tab-a"
                   role="tab"
                ></a>
            </li>
        </ul>
        <div class="tabs-component-panels">
            <slot/>
        </div>
    </div>
</template>

<script>    

    export default {
        name : 'Tabs',
        props: {
            cacheLifetime: {
                default: 5,
            },
            options: {
                type: Object,
                required: false,
                default: () => ({
                    useUrlFragment: true,
                    defaultTabHash: null,
                }),
            },
        },

        data: () => ({
            tabs: [],
            activeTabHash: '',
            activeTabIndex: 0,
            lastActiveTabHash: '',
        }),

        computed: {
            storageKey() {
                return `vue-tabs-component.cache.${window.location.host}${window.location.pathname}`;
            },
        },

        created() {
            this.tabs = this.$children;
        },

        mounted() {
            if (this.tabs.length) {
                this.selectTab(this.tabs[0].hash);
            }
        },

        methods: {
            findTab(hash) {
                return this.tabs.find(tab => tab.hash === hash);
            },

            selectTab(selectedTabHash, event) {
                // See if we should store the hash in the url fragment.
                if (event && !this.options.useUrlFragment) {
                    event.preventDefault();
                }

                const selectedTab = this.findTab(selectedTabHash);

                if (! selectedTab) {
                    return;
                }

                if (this.lastActiveTabHash === selectedTab.hash) {
                    this.$emit('clicked', { tab: selectedTab });
                    return;
                }

                this.tabs.forEach(tab => {
                    tab.isActive = (tab.hash === selectedTab.hash);
                });

                this.$emit('changed', { tab: selectedTab });

                this.activeTabHash = selectedTab.hash;
                this.activeTabIndex = this.getTabIndex(selectedTabHash);

                this.lastActiveTabHash = this.activeTabHash = selectedTab.hash;                
            },            
            
            getTabIndex(hash){
            	const tab = this.findTab(hash);
            	
            	return this.tabs.indexOf(tab);
            },
            
			getTabHash(index){
            	const tab = this.tabs.find(tab => this.tabs.indexOf(tab) === index);
            	
            	if (!tab) {
					return;
                }
                
                return tab.hash;
			},
            
            getActiveTab(){
            	return this.findTab(this.activeTabHash);
            },
            
			getActiveTabIndex() {
            	return this.getTabIndex(this.activeTabHash);
            },
        },
    };
</script>
