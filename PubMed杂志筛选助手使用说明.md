<left><img src="md_image\ep.png" width=10% style="float:left"/></left>
<a id="top"></a>
# PubMed杂志筛选助手使用说明

> **PubMed杂志筛选助手帮助您筛选您所在专业需重点关注的杂志，自动将杂志转化为PubMed过滤器检索式并导入您PubMed账号。**


## 背景

医务科研工作者很多时候希望阅读在其研究领域高水平杂志发表的文章。尽管PubMed提供了根据相关性（Best match）排序查找文献的功能，但其搜索结果可能并不令人满意。比如，当我们希望阅读在高分杂志（如大于5分）或发表在一区杂志的文章时，我们会发现PubMed并不能提供给理想的搜索结果。

既往我们可以通过PubMed过滤器功能帮助实现这一目的，如将影响因子（IF）超过5分的全部杂志ISSN编号输入PubMed过滤器。但随着2018年PubMed对于过滤器[使用新规](https://www.ncbi.nlm.nih.gov/books/NBK53591/)，即过滤器字符数不可超过4000字，的推出，这种将全部杂志ISSN号放入过滤器（通常字符数远超4000）的方法已无法使用了。自新规推出后，目前市面并没有很好的此问题解决办法。

众所周知，SCI收录的杂志很多并不与医学、生物学领域相关，即便医学、生物学领域相关杂志，很多杂志也有明显的领域倾向性，如Journal of Neurology收录文章多专注于神经病学领域。因此，对于特定的研究专业、特定的课题，我们并不需要将全部符合要求（如IF大于5分）的杂志都输入过滤器，而只需要将与我们研究相关领域的杂志输入即可。

基于以上的分析，本人制作了**PubMed杂志筛选助手**，它可以帮助您筛选您所在专业需重点关注的杂志，自动将杂志转化为PubMed过滤器检索式并导入您PubMed账号。

## 使用流程

PubMed杂志筛选助手使用分为以下3个步骤（如下图）：
- **筛选杂志**
- **构建过滤器检索式**
- **发送过滤器检索式至PubMed并激活过滤器**
<p align="center">
      <img src="md_image\filterManager1.png" width=60% />
</p>

#### 1. 筛选杂志
建议先根据杂志重要性、杂志类别筛选杂志，而后可根据具体需求增添或删除部分杂志

- 根据杂志重要性筛选：如下图，程序提供四种按杂志重要性筛选的方案：JCR分区、CAS分区、是否为顶级刊物及影响因子范围

<p align="center">
      <img src="md_image\filterManagerImportance_cn.png" width=60% />
</p>

- 根据杂志类别筛选：如下图，根据中科院分区杂志被分为13大类，各大类下又分为很多小类。您可以在这里根据你所学专业、所研究课题定制需关注的领域。括号内数字表示在当前重要性筛选条件下该分类下杂志数目。
  
   - 选择杂志分类选项卡：根据需求点选需要的分类
   - 预览杂志分类选项卡：左侧表示已选择分类、右侧表示未选择分类，单击各分类标签可以在‘选择’与‘未选择’类别中切换

<p align="center">
      <img src="md_image\filterManagerCategory_cn.png" width=60% />
</p>

- 自定义添加杂志：如下图，您可以输入希望添加至列表的杂志名、缩写、ISSM或eISSN号，如果该杂志未出现在已选杂志列表中，您可以点击‘添加’按键添加此杂志至列表。自定义添加的杂志将在下方展示。
<p align="center">
      <img src="md_image\filterManagerAdd_cn.png" width=60% />
</p>

- 自定义删除杂志：如下图，您可在此界面查看已选中的杂志目录，可根据您的需求点击表格后端的‘删除按键’删除部分杂志。自定义删除的杂志将在下方展示。
<p align="center">
      <img src="md_image\filterManagerDel_cn.png" width=60% />
</p>

#### 2. 构建过滤器检索式
如下图，程序会根据选中杂志自动构建过滤器检索式，您可以在‘自定义检索式’中添加您自定义检索内容，如输入'y_5[Filter]'或'2015[Date - Publication] : 3000[Date - Publication])'以搜索近五年发表文献。

<p align="center">
      <img src="md_image\filterManagerCustomize_cn.png" width=60% />
</p>

#### 3. 发送过滤器检索式至PubMed并激活过滤器
点击‘发送过滤器至PUBMED’按键，按提示操作即可完成。请参考[发送过滤器至PUBMED](#sendPubmed)使用说明

## 操作台使用
<p align="center">
      <img src="md_image\filterManagerDashboard_cn.png" width=60% />
</p>
如上图，页面下方操作台会展示目前过滤器的基本信息

- 点击中部‘锁头’按钮可隐藏操作台
- 左侧为过滤器名称、作者及过滤器描述，可在此处或点击白色‘编辑’图标进行编辑
- 中部为过滤器信息情况统计，符合PubMed要求的过滤器检索式长度需小于4000字（过滤器符合要求时，圆环将变为白色，如下图）

<p align="center">
      <img src="md_image\filterManagerDashboard2_cn.png" width=60% />
</p>

- 右侧为功能按键区，共5个按键：发送过滤器至PUBMED、保存、载入、分享及重置
  
  1. <a id="sendPubmed"></a>**发送过滤器至PUBMED**：点击此按键会出现如下界面，将过滤器发送至PUBMED需完成以下4步骤，请按照提示完成。
  
       - 登录PubMed账号
       - 过滤器命名
       - 提交过滤器至PubMed
       - 确认并激活过滤器
  <p align="center">
      <img src="md_image\filterManagerSendPubmed_cn.png" width=60% />
</p>

切记在最后一步，**需要在PubMed网站激活此过滤器**才可以在搜索界面使用。正确激活后您将在搜索界面左上角看到相应过滤器名称，如下图。
<p align="center">
      <img src="md_image\filterManagerSendPubmedSuccess2_cn.png" width=60% />
</p>

  2. **保存**：点击此按键可以保存过滤器，保存过滤器必须提供过滤器名称。
  3. **加载**：您可以在这里选择已保存的过滤器并加载，也可以将从EasyPumed过滤器编码分享平台获取的过滤器编码粘贴至‘过滤器编码’处并加载。此外，在这里也可以删除已保存的过滤器。插件最多支持保存50个过滤器。
   
<p align="center">
      <img src="md_image\filterManagerLoad_cn.png" width=60% />
</p>

  4. **分享**： 点击分享按钮您可以将您制作的过滤器编码分享到EasyPumed过滤器编码分享平台。您定制的杂志列表会帮助与您相同领域工作者，欢迎分享。

<p align="center">
      <img src="md_image\filterManagerShare_cn.png" width=60% />
</p>

  5. **重置**：重置过滤器