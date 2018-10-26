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
            ['script',{src:'https://hm.baidu.com/hm.js?03f40be28ff9a31fd798fd6b9dac0946'}]
    ],
    markdown: {
        lineNumbers: true,
        externalLinks: {
            target: '_self'
        },
    },
    evergreen: true,
    themeConfig: {
        lastUpdated: '最后更新时间：',
        sidebarDepth: 2,
        nav: [{
                text: '首页',
                link: '/'
            },
            {
                text: 'Java',
                link: '/doc/java/'
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
                text: 'GridGain中国官网',
                link: 'http://www.gridgainchina.com'
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
                'MachineLearningGrid',
                'Persistence',
                'TestsAndBenchmarking',
                'Metrics',
                'ThinClients',
                'KubernetesDeployment'
            ],
            '/doc/sql/': [
                '',
                'SQLReference',
                'Architecture',
                'JDBC',
                'ODBC',
                'ToolsAndAnalytics',
                'JavaDeveloperGuide',
                'PHPDeveloperGuide'
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
                'ControlScript'
            ],
            '/': [
                ''
            ]
        }
    }
}