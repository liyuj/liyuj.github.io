module.exports = {
    title: 'Apache Ignite技术服务',
    description: 'apache ignite,ignite中文,ignite官网,内存数据库,分布式数据库',
    dest: "dist",
    head: [
        ['meta', { "name": 'keywords', "content": 'apache ignite,ignite中文,ignite官网,内存数据库,分布式数据库' }],
        ['meta', { "http-equiv": 'cache-control', "content": 'no-store,no-cache,must-revalidate' }],
        ['meta', { "http-equiv": 'expires', "content": '0' }],
        ['link', {rel: 'stylesheet',href: `/css/plugin.css`}],
        ['link', {rel: 'stylesheet',href: `/css/style.css`}],
        ['link', {rel: 'stylesheet',href: `/css/font-awesome.min.css`}],
        ['link', {rel: 'shortcut icon',type: "image/x-icon",href: `/favicon.ico`}],
        ['script', {src: 'https://hm.baidu.com/hm.js?9d04fe7543c80b1f04c5f9571193ac90'}]
    ],
    markdown: {        
        externalLinks: {
            target: '_self'
        },
    },
    locales: {
        '/': {},
        '/doc/2.8.0/': {},
        '/doc/2.7.0/':{},
        '/doc/2.6.0/': {}        
    },
    evergreen: true,
    plugins: ['@dovyp/vuepress-plugin-clipboard-copy','@vuepress/back-to-top','@vuepress/nprogress'],
    themeConfig: {
        lastUpdated: '最后更新时间：',
        search: true,
        searchMaxSuggestions: 10,
        serviceWorker: {
            updatePopup: {
                message: "内容有更新。",
                buttonText: "刷新"
            }
        },
        sidebarDepth: 2,
        locales: {
            '/': {
                selectText: '最新版本',
                label: '2.9.0',
                nav: [{
                    text: '首页',
                    link: '/'
                },
                {
                    text: '服务&报价',
                    link: '/Service'
                },
                {
                    text: '文档',
                    link: '/doc/java/'
                },
                {
                    text: '博客',
                    link: 'https://my.oschina.net/liyuj'
                },
                {
                    text: 'Confluent平台',
                    link: '/confluent/'
                }],
                sidebar: {
                    '/doc/java/': [
                        '',
                        'QuickStartGuide',
                        'Installation',
                        'SettingUp',
                        'StartingNodes',
                        'Clustering',
                        'ThinClients',
                        'DataModeling',
                        'ConfiguringMemory',
                        'Persistence',
                        'ConfiguringCaches',
                        'DataRebalancing',
                        'DataStreaming',
                        'UsingKeyValueApi',
                        'Transactions',                        
                        'WorkingwithSQL',
                        'SQLReference',
                        'DistributedComputing',
                        'CodeDeployment',
                        'MachineLearning',
                        'ContinuousQueries',
                        'Service',
                        'Messaging',
                        'DataStructures',
                        'DistributedLocks',
                        'RESTAPI',
                        'DotnetSpecific',
                        'CppSpecific',
                        'Monitoring',
                        'WorkingwithEvents',
                        'Tools',
                        'Security',
                        'ExtensionsIntegrations',
                        'Plugins',
                        'PerformanceTroubleshooting',
                        'Legal'
                    ],
                    '/confluent/':[
                        '',
                        'Kafka-ConvertersSerialization',
                        'Kafka-ErrorHandlingDeadLetterQueues',
                        `Kafka-CreateDynamicConnectors`,
                        `Kafka-SingleMessageTransformation`,
                        'Kafka-ConnectImprovementsIn-2-3',
                        'Kafka-FastestMessagingSystem',
                        'SecureKafkaDeploymentBestPractices'
                    ],
                    '/': [
                        ''
                    ]
                }
            },
            '/doc/2.8.0/': {
                selectText: '2.8.0',
                label: '2.8.0',
                nav: [{
                    text: '首页',
                    link: '/doc/2.8.0/'
                },
                {
                    text: 'Java',
                    link: '/doc/2.8.0/java/'
                },
                {
                    text: 'C++',
                    link: '/doc/2.8.0/cpp/'
                },
                {
                    text: 'C#/.NET',
                    link: '/doc/2.8.0/net/'
                },
                {
                    text: 'SQL',
                    link: '/doc/2.8.0/sql/'
                },
                {
                    text: '集成',
                    link: '/doc/2.8.0/integration/'
                },
                {
                    text: 'Ignite&Spark',
                    link: '/doc/2.8.0/spark/'
                },
                {
                    text: '工具',
                    link: '/doc/2.8.0/tools/'
                }],
                sidebar: {
                    '/doc/2.8.0/java/': [
                        '',
                        'BasicConcepts',
                        'InstallAndDeployment',
                        'KubernetesDeployment',
                        'Clustering',
                        'Key-ValueDataGrid',
                        'DataLoadingStreaming',
                        'DistributedDataStructures',
                        'ComputeGrid',
                        'ServiceGrid',
                        'MessagingEvents',
                        'DurableMemory',
                        'Persistence',
                        'MachineLearning',
                        'ThinClients',
                        'PlatformsProtocols',
                        'Plugins',
                        'Security',
                        'TestsAndBenchmarking',
                        'Metrics',
                        'ProductionReadiness',
                        'Legal'
                    ],
                    '/doc/2.8.0/cpp/': [
                        '',
                        'Clustering',
                        'Key-ValueDataGrid',
                        'DistributedSQL',
                        'ComputeGrid',
                        'DurableMemory',
                        'Persistence'
                    ],
                    '/doc/2.8.0/net/': [
                        '',
                        'Clustering',
                        'DataGrid',
                        `Streaming`,
                        'ComputeGrid',
                        'DataStructures',
                        'Messaging',
                        'Events',
                        'DurableMemory',
                        `Persistence`,
                        'ThirdPartyIntegrations'
                    ],
                    '/doc/2.8.0/sql/': [
                        '',
                        'SQLReference',
                        'Architecture',
                        'JDBC',
                        'ODBC',
                        'ToolsAndAnalytics',
                        'JavaDeveloperGuide',
                        'NETDeveloperGuide',
                        'CplusDeveloperGuide',
                        'PHPDeveloperGuide',
                        'ManagementMonitoring',
                        'SqlKeyValue'
                    ],
                    '/doc/2.8.0/integration/': [
                        '',
                        'Clustering',
                        'WebSessionClustering',
                        'OSGiSupport',
                        'Spring',
                        'CassandraIntegration',
                        'StreamingIntegrations',
                        'Hibernate',
                        'MyBatis'
                    ],
                    '/doc/2.8.0/spark/': [
                        '',
                        'IgniteForSpark'
                    ],
                    '/doc/2.8.0/tools/': [
                        '',
                        'ControlScript',
                        'Informatica'
                    ],
                    '/doc/2.8.0/': [
                        ''
                    ]
                }
            },
            '/doc/2.7.0/':{
                selectText: '2.7.0',
                label: '2.7.0',
                nav: [{
                    text: '首页',
                    link: '/doc/2.7.0/'
                },
                {
                    text: 'Java',
                    link: '/doc/2.7.0/java/'
                },
                {
                    text: 'C++',
                    link: '/doc/2.7.0/cpp/'
                },
                {
                    text: 'C#/.NET',
                    link: '/doc/2.7.0/net/'
                },
                {
                    text: 'SQL',
                    link: '/doc/2.7.0/sql/'
                },
                {
                    text: '集成',
                    link: '/doc/2.7.0/integration/'
                },
                {
                    text: 'Ignite&Spark',
                    link: '/doc/2.7.0/spark/'
                },
                {
                    text: '工具',
                    link: '/doc/2.7.0/tools/'
                }],
                sidebar: {
                    '/doc/2.7.0/java/': [
                        '',
                        'Clustering',
                        'Key-ValueDataGrid',
                        'DataLoadingStreaming',
                        'DistributedDataStructures',
                        'ComputeGrid',
                        'ServiceGrid',
                        'MessagingEvents',
                        'DurableMemory',
                        'Persistence',
                        'MachineLearning',
                        'DeepLearning',
                        'ThinClients',
                        'PlatformsProtocols',
                        'Plugins',
                        'Security',
                        'Deployment',
                        'KubernetesDeployment',
                        'TestsAndBenchmarking',
                        'Metrics',
                        'ProductionReadiness'
                    ],
                    '/doc/2.7.0/cpp/': [
                        '',
                        'Clustering',
                        'Key-ValueDataGrid',
                        'DistributedSQL',
                        'ComputeGrid',
                        'DurableMemory',
                        'Persistence'
                    ],
                    '/doc/2.7.0/net/': [
                        '',
                        'Clustering',
                        'DataGrid',
                        `Streaming`,
                        'ComputeGrid',
                        'DataStructures',
                        'Messaging',
                        'Events',
                        'DurableMemory',
                        `Persistence`,
                        'ThirdPartyIntegrations'
                    ],
                    '/doc/2.7.0/sql/': [
                        '',
                        'SQLReference',
                        'Architecture',
                        'JDBC',
                        'ODBC',
                        'ToolsAndAnalytics',
                        'JavaDeveloperGuide',
                        'PHPDeveloperGuide',
                        'ManagementMonitoring',
                        'SqlKeyValue'
                    ],
                    '/doc/2.7.0/integration/': [
                        '',
                        'Clustering',
                        'WebSessionClustering',
                        'OSGiSupport',
                        'Spring',
                        'CassandraIntegration',
                        'StreamingIntegrations',
                        'Hibernate',
                        'MyBatis'
                    ],
                    '/doc/2.7.0/spark/': [
                        '',
                        'In-MemoryFileSystem',
                        'HadoopAccelerator',
                        'IgniteForSpark'
                    ],
                    '/doc/2.7.0/tools/': [
                        '',
                        'IgniteWebConsoleAbilities',
                        'VisorManagementConsole',
                        'ControlScript',
                        'Informatica'
                    ],
                    '/doc/2.7.0/': [
                        ''
                    ]
                }
            },
            '/doc/2.6.0/': {
                selectText: '2.6.0',
                label: '2.6.0',
                nav: [{
                    text: '首页',
                    link: '/doc/2.6.0/'
                },
                {
                    text: 'Java',
                    link: '/doc/2.6.0/java/'
                },
                {
                    text: 'SQL',
                    link: '/doc/2.6.0/sql/'
                },
                {
                    text: '集成',
                    link: '/doc/2.6.0/integration/'
                },
                {
                    text: 'Ignite&Spark',
                    link: '/doc/2.6.0/spark/'
                },
                {
                    text: '工具',
                    link: '/doc/2.6.0/tools/'
                }],
                sidebar: {
                    '/doc/2.6.0/java/': [
                        '',
                        'Clustering',
                        'Key-ValueDataGrid',
                        'Security',
                        'DataLoadingStreaming',
                        'DistributedDataStructures',
                        'ComputeGrid',
                        'ServiceGrid',
                        'MessagingEvents',
                        'DurableMemory',
                        'ProductionReadiness',
                        'PlatformsProtocols',
                        'Plugins',
                        'Deployment',
                        'MachineLearningGrid',
                        'Persistence',
                        'TestsAndBenchmarking',
                        'Metrics',
                        'ThinClients',
                        'KubernetesDeployment'
                    ],
                    '/doc/2.6.0/sql/': [
                        '',
                        'SQLReference',
                        'Architecture',
                        'JDBC',
                        'ODBC',
                        'ToolsAndAnalytics',
                        'JavaDeveloperGuide',
                        'PHPDeveloperGuide'
                    ],
                    '/doc/2.6.0/integration/': [
                        '',
                        'Clustering',
                        'WebSessionClustering',
                        'OSGiSupport',
                        'Spring',
                        'CassandraIntegration',
                        'StreamingIntegrations',
                        'Hibernate',
                        'MyBatis'
                    ],
                    '/doc/2.6.0/spark/': [
                        '',
                        'In-MemoryFileSystem',
                        'HadoopAccelerator',
                        'IgniteForSpark'
                    ],
                    '/doc/2.6.0/tools/': [
                        '',
                        'IgniteWebConsoleAbilities',
                        'VisorManagementConsole',
                        'ControlScript'
                    ],
                    '/doc/2.6.0/': [
                        ''
                    ]
                }
            }
        }
    }
}
