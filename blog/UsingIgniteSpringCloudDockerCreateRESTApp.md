# 使用Ignite+SpringCloud+Docker创建REST应用
本文将讲解基于Spring Cloud和Ignite的RESTful Web服务的创建过程。该服务是将Ignite用作为高性能内存数据库的容器化应用，使用HashiCorp Consul进行服务发现，并通过Spring Data存储库抽象与Ignite集群进行交互，容器化通过Docker实现。
## 配置和启动
### 配置Consul服务注册
为了方便起见，可以使用Consul的官方Docker镜像（需要先安装Docker）：

启动Consul的Docker镜像：
```shell
docker run -d -p 8500:8500 -p 8600:8600/udp --name=consul consul agent -server -ui -node=server-1 -bootstrap-expect=1 -client=0.0.0.0
```
### 创建一个基本的Spring Cloud应用
创建该应用可以从[https://start.spring.io](https://start.spring.io)入手。

这里需要Spring Web和Spring Consul Discovery模块，Spring Web是创建REST应用的最简单的框架之一，Spring Consul Discovery可以将多个Spring应用实例组合成一个服务。

![](https://www.gridgain.com/sites/default/files/inline-images/image1.pn

 - 通过Spring Initializr配置项目（如上图所示）；
 - 点击`Generate`按钮，然后会下载包含项目工程的压缩包；
 - 使用某个IDE打开该压缩包；
 - （可选）将`application.properties`文件替换为`application.yml`，当然可以继续使用属性文件格式，但是本文后续会使用YAML格式。

在`application.yml`中，为Sprint Cloud添加了基本的参数，给应用命名并启用了Consul服务发现：
```yaml
spring:
  application:
    name: myapp
    instance_id: 1
  cloud:
    consul:
      enabled: true
    service-registry:
      enabled: true
```
### 添加Ignite依赖
可以从[Maven中央仓库](https://mvnrepository.com/artifact/org.apache.ignite/ignite-core)获得Ignite的最新版本，然后将其添加到构建配置文件中：
```
implementation 'org.apache.ignite:ignite-spring-data_2.2:2.8.1'
compile group: 'org.apache.ignite', name: 'ignite-core', version: '2.8.1'
implementation 'org.apache.ignite:ignite-spring-boot-autoconfigure-ext:1.0.0'
```
### 配置Ignite节点发现
如何使Ignite节点相互发现呢？Ignite具有一个`IpFinder`组件，该组件用于处理节点的注册和发现，更多的细节信息，请参见[Ignite的文档](https://www.ignite-service.cn/doc/java/Clustering.html#_1-1-发现机制)。

为了集成IpFinder和Consul服务注册，需要使用Spring Cloud Discovery模块，可以将模块与大量发现服务一起使用（例如Zookeeper）。

对于HashiCorp Consul，有一个[简单的IpFinder实现](https://github.com/SammyVimes/bootnite/blob/master/src/main/java/com/github/sammyvimes/bootnite/discovery/TcpDiscoveryConsulIpFinder.java)，但是在GitHub上有许多IpFinder的第三方实现。
### 配置Spring Cloud和Ignite
因为使用了Ignite的自动配置模块，所以配置是一个相对简单的过程，将以下内容放入`application.yml`文件中：
```yaml
ignite:
  workDirectory: /opt/ignite/
```
Ignite将其数据存储在工作目录中。

现在需要添加对[Ignite Spring Data](https://www.ignite-service.cn/doc/java/ExtensionsIntegrations.html#_1-2-spring-data)存储库的支持。添加支持的方法之一是通过Java的`Configuration`：只需添加一个`EnableIgniteRepositories`注解，并将存储库软件包作为参数即可：
```java
@Configuration
@EnableIgniteRepositories(value = "com.github.sammyvimes.bootnite.repo")
public class IgniteConfig {

}
```
在编译应用之前，需要解决一些问题。Ignite不支持Spring Data的H2版本。因此必须在构建配置中重置H2的版本（无论是Gradle还是Maven）：
```
ext {
        set('h2.version', '1.4.197')
 }
```
另外，Spring Cloud Consul和hystrix还有已知的问题，因此需要将其排除：
```
implementation ('org.springframework.cloud:spring-cloud-starter-consul-discovery') {
        exclude group: 'org.springframework.cloud', module: 'spring-cloud-netflix-hystrix'
 }
```
最后，关于Spring Data BeanFactory，还有一个问题：BeanFactory会查找一个名为`igniteInstance`的bean，而自动配置则提供一个名为`ignite`的bean，后续会解决这个问题。

但是现在，需要对配置类做如下的修改来解决BeanFactory的问题：
```java
@Configuration
@EnableIgniteRepositories(value = "com.github.sammyvimes.bootnite.repo")
public class IgniteConfig {


@Bean(name = "igniteInstance")
    public Ignite igniteInstance(Ignite ignite) {
        ignite.active(true);
        return ignite;
    }

}
```
### 创建Ignite的Spring Data存储库和服务
下面会创建一个基于Ignite Spring Data存储库的CRUD服务。

下面会从最常见的示例开始，即`Employee`类：
```java
public class Employee implements Serializable {

    private UUID id;

    private String name;

    private boolean isEmployed;

        // constructor, getters & setters
}
```
定义数据模型之后，就要添加配置器bean：
```java
@Bean
    public IgniteConfigurer configurer() {
        return igniteConfiguration -> {
            CacheConfiguration cache = new CacheConfiguration("employeeCache");
            cache.setIndexedTypes(UUID.class, Employee.class);

            igniteConfiguration.setCacheConfiguration(cache);
        };
    }
```
这样当应用启动后，会部署`employeeCache`缓存，该缓存包含可加快对`Employee`实体查询的索引。

接下来，与其他Spring Data存储服务一样，需要创建一个存储库和一个服务：
```java
@Repository
@RepositoryConfig(cacheName = "employeeCache")
public interface EmployeeRepository
        extends IgniteRepository<Employee, UUID> {
    Employee getEmployeeById(UUID id);
}
```
注意`RepositoryConfig`注解，其将存储库链接到即将使用的缓存，之前已经使用`employeeCache`字符串作为名字创建了一个缓存。

接下来是一个使用该存储库的简单服务：
```java
@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository repository;

    // constructor injection FTW
    public EmpoyeeService(final EmployeeRepository repository) {
        this.repository = repository;
    }

    public List<Employee> findAll() {
        return StreamSupport.stream(repository.findAll().spliterator(), false)
                .collect(Collectors.toList());
    }

    public Employee create(final String name) {
        final Employee employee = new Employee();
        final UUID id = UUID.randomUUID();
        employee.setId(id);
        employee.setEmployed(true);
        employee.setName(name);
        return repository.save(id, employee);
    }
}
```
这里有2个方法，`create`和`findAll`，用于演示Ignite和Spring Data的集成。
### 配置REST控制器
下面会配置一些端点，以便可以访问和修改数据，一个简单的控制器就可以了：
```java
@RestController
@RequestMapping("/employee")
public class EmployeeController {

    private final EmpoyeeService service;

    public EmployeeController(final EmployeeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Employee>> employees() {
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping
    public ResponseEntity<Employee> create(@RequestParam final String name) {
        return ResponseEntity.ok(service.create(name));
    }

}
```
这样，这个应用就开发完了。

现在就可以启动应用，通过向`/employee`发送`POST`请求来创建数据，并通过发送`GET`请求来查询数据。

虽然这个应用性能很高，但是分布式存储的优势在哪里呢？
## 在Docker中部署应用
可以通过Docker来创建和管理应用节点。

首先在工程的根目录，为应用创建一个Dockerfile：
```
FROM adoptopenjdk:8-jre-hotspot
RUN mkdir /opt/app && mkdir /opt/ignite
COPY build/libs/bootnite-0.0.1-SNAPSHOT.jar /opt/app/app.jar
CMD ["java", "-jar", "/opt/app/app.jar"]
```
简单地说：获取OpenJDK，为应用创建目录，往镜像中复制应用的二进制文件，并创建默认命令以启动应用。

现在，在工程的根目录中，运行`gradle build`和`docker build -t ignite-test-app：0.1 -f .dockerfile`。

接下来，通过Docker，同时启动应用的两个实例。

通过编写了以下shell脚本，可以帮助启动节点：

MacOS：
```shell
export HOST_IP=$(ipconfig getifaddr en0)
docker run -P -e HOST_IP=${HOST_IP} -e DISCO_PORT=$2 -p $2:47500 --name $1 ignition
```
Linux：
```shell
export HOST_IP=$(ip -4 addr show docker0 | grep -Po 'inet \K[\d.]+')
docker run -P -e HOST_IP=${HOST_IP} -e DISCO_PORT=$2 -p $2:47500 --name $1 ignition
```
在这里所做的是获取主机IP地址，以便可以使用端口转发，并使节点之间可以相互通信。使用`-p`参数为Docker容器创建端口转发规则，并使用`-e`参数将外部端口的值保存在容器的环境中，以便稍后可以在如下配置中使用这些值：
```yml
spring:
  application:
    name: myapp
    instance_id: 1
  cloud:
    consul:
      enabled: true
      host: ${HOST_IP}
    service-registry:
      enabled: true

ignition:
  disco:
    host: ${HOST_IP}
    port: ${DISCO_PORT}
```
这里添加了自定义配置参数`ignition.disco.host`和`ignition.disco.port`，这些参数将在自定义IP探测器中使用。注意还通过添加主机IP地址来更改Consul的配置。

现在，更改Ignite Java配置后就完成了：
```java
@Bean
    public TcpDiscoveryConsulIpFinder finder(final ConsulDiscoveryClient client,
                                             final ConsulServiceRegistry registry,
                                             final ConsulDiscoveryProperties properties,
                                             @Value("${ignition.disco.host}") final String host,
                                             @Value("${ignition.disco.port}") final int port) {
        return new TcpDiscoveryConsulIpFinder(client, registry, properties, host, port);
    }

    @Bean
    public IgniteConfigurer configurer(final TcpDiscoveryConsulIpFinder finder) {
        return igniteConfiguration -> {
            CacheConfiguration cache = new CacheConfiguration("employeeCache");
            cache.setIndexedTypes(UUID.class, Employee.class);

            igniteConfiguration.setCacheConfiguration(cache);
            final TcpDiscoverySpi tcpDiscoverySpi = new TcpDiscoverySpi();
            tcpDiscoverySpi.setIpFinder(finder);

            igniteConfiguration.setDiscoverySpi(tcpDiscoverySpi);
        };
    }
```
执行下面的测试，可以看下是否一切正常：

 1. 启动一个应用实例：`./starter/start.sh test1 30000`；
 2. 将一些数据提交到实例；例如`curl -d'name = admin'http：// localhost：32784/employee`，不同的容器使用不同的端口；
 3. 通过在终端中执行`docker ps`确定容器的端口转发规则（规则类似于0.0.0.0:32784->8080/tcp），确定要使用的端口；
 4. 启动另一个节点：`./starter/start.sh test2 30001`；
 5. 停止第一个节点（如果是从终端启动容器，则可以使用`Ctrl + c`）；
 6. 执行对第二个节点的`GET`请求，并验证从此请求获取的数据和从第一个请求获取的数据是否相同：`curl  http://localhost:32785/employee`。

注意，此curl命令中的端口和上一个curl命令中的端口不相同，因为两个应用实例占用不同的端口。

如上所述，通过上述几段简单的代码，就实现了Ignite和Spring Cloud架构的集成。