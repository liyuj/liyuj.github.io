module.exports = {
    title: 'Apache Ignite中文网',
    description: '轻量级分布式内存HTAP数据库及计算平台GridGain中国大陆地区独家合作伙伴',
    dest: "dist",
    head: [
        ['meta', { "http-equiv": 'cache-control', "content": 'no-store,no-cache,must-revalidate' }],
        ['meta', { "http-equiv": 'expires', "content": '0' }],
        ['link', {rel: 'stylesheet',href: `css/plugin.css`}],
        ['link', {rel: 'stylesheet',href: `css/style.css`}],
        ['link', {rel: 'shortcut icon',type: "image/x-icon",href: `https://ignite.apache.org/favicon.ico`}],
        ['script', {
            src: 'https://hm.baidu.com/hm.js?03f40be28ff9a31fd798fd6b9dac0946'
        }]
    ],
    markdown: {
        lineNumbers: true,
        externalLinks: {
            target: '_self'
        },
    },
    locales: {
        '/': {},
        '/doc/2.6.0/': {}
    },
    evergreen: true,
    plugins: ['@dovyp/vuepress-plugin-clipboard-copy','@vuepress/back-to-top','@vuepress/nprogress'],
    themeConfig: {
        lastUpdated: '最后更新时间：',
        smoothScroll: true,
        search: false,
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
                label: '2.7.0',
                nav: [{
                    text: '首页',
                    link: '/'
                },
                {
                    text: 'Java',
                    link: '/doc/java/'
                },
                {
                    text: 'C++',
                    link: '/doc/cpp/'
                },
                {
                    text: 'C#/.NET',
                    link: '/doc/net/'
                },
                {
                    text: 'SQL',
                    link: '/doc/sql/'
                },
                {
                    text: '集成',
                    link: '/doc/integration/'
                },
                {
                    text: 'Ignite&Spark',
                    link: '/doc/spark/'
                },
                {
                    text: '工具',
                    link: '/doc/tools/'
                },
                {
                    text: '博客',
                    link: 'https://my.oschina.net/liyuj'
                },
                {
                    text: '历史版本',
                    link: 'https://www.zybuluo.com/liyuj/note/230739'
                },
                {
                    text: '服务内容',
                    link: '/Service'
                },

                ],
                sidebar: {
                    '/doc/java/': [
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
                    '/doc/cpp/': [
                        '',
                        'Clustering',
                        'Key-ValueDataGrid',
                        'DistributedSQL',
                        'ComputeGrid',
                        'DurableMemory',
                        'Persistence'
                    ],
                    '/doc/net/': [
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
                    '/doc/sql/': [
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
                    '/doc/integration/': [
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
                    '/doc/spark/': [
                        '',
                        'In-MemoryFileSystem',
                        'HadoopAccelerator',
                        'IgniteForSpark'
                    ],
                    '/doc/tools/': [
                        '',
                        'IgniteWebConsoleAbilities',
                        'VisorManagementConsole',
                        'ControlScript',
                        'Informatica'
                    ],
                    '/doc/gridgain/': [
                        '',
                        'OracleGoldenGateIntegration',
                        'KafkaConnector',
                        'SecurityAndAudit',
                        'DataCenterReplication'
                    ],
                    '/confluent/': [
                        '',
                        'Kafka-ConvertersSerialization',
                        'Kafka-ErrorHandlingDeadLetterQueues',
                        'Kafka-ConnectImprovementsIn-2-3'
                    ],
                    '/': [
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
                },
                {
                    text: '博客',
                    link: 'https://my.oschina.net/liyuj'
                }
                ],
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
