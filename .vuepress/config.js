module.exports = {
    title: 'Apache Ignite中文站',
    description: 'Ignite内存计算平台的中文文档及相关资料',
    dest: "dist",
    head: [
        ['link', {
            rel: 'shortcut icon',
            type: "image/x-icon",
            href: `https://ignite.apache.org/favicon.ico`
        }],
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
    themeConfig: {
        lastUpdated: '最后更新时间：',
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
                        text: '商业版',
                        link: '/doc/gridgain/'
                    },
                    {
                        text: '博客',
                        link: 'https://my.oschina.net/liyuj'
                    },
                    {
                        text: '历史版本',
                        link: 'https://www.zybuluo.com/liyuj/note/230739'
                    }
                ],
                sidebar: {
                    '/doc/java/': [
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
                        'MachineLearning',
                        'Persistence',
                        'TestsAndBenchmarking',
                        'Metrics',
                        'ThinClients',
                        'KubernetesDeployment',
                        'DeepLearning'
                    ],
                    '/doc/cpp/':[
                        '',
                        'Clustering',
                        'Key-ValueDataGrid',
                        'DistributedSQL',
                        'ComputeGrid',
                        'DurableMemory',
                        'Persistence'
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
                    '/doc/gridgain/':[
                        '',
                        'OracleGoldenGateIntegration',
                        'KafkaConnector',
                        'SecurityAndAudit'
                    ],
                    '/blog/':[
                        '',
                        'ApacheIgniteBaselineTopology'
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
                    },
                    {
                        text: '历史版本',
                        link: 'https://www.zybuluo.com/liyuj/note/230739'
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