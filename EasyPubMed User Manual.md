<left><img src="md_image\ep.png" width=10% style="float:left"/></left>

# EasyPubMed User Manual

EasyPubMed is a Chrome extension to make New PubMed easy to use.

## Functions and Features

- Design for new PubMed

- Rapid loading: use local database, average loading time <0.1s

- One click to get full-screen paper PDF without sidebar from Sci-Hub

- Display journal impact factor (IF) 

- Display JCR (Journal Citation Reports) journal's quartile ranking or CAS (Chinese Academy of Sciences) journal's block ranking

- BibTex support

## Setup

Support web browser: Chrome, Edge

1. Download the extension: [EasyPubMed](h)

## Details

- **EasyPubMed Tool Bar**
<p align="center">
<img src="/md_image/image-20200621173353849.png" alt="image-20200621173353849" width=70% >
</p>
After installing EasyPubMed, a tool bar will display below each article in the PubMed website.

1. EasyPubMed Icon: Link to EasyPubMed  homepage in Github

2. Display  JCR (Journal Citation Reports) journal's quartile ranking or CAS (Chinese Academy of Sciences) journal's block ranking  as you set in popup page

   - JCR Quartile Ranking: Data from 2019 *Journal Citation Reports*, the best journal performance in all subcategories (include SSCI and SCIE) is tagged. For example, if the journal get Q1 in A subcategory and Q3 in B subcategory, the journal will be labelled as Q1, the best performance. We use Q1 (red), Q2 (yellow), Q3 (green), Q4 (grey) with different color to display different JCR quartile ranking. NA stands for not recorded in the report.

    <img src="/md_image/image-20200621180515339.png" alt="image-20200621180515339" width=20% />

   - CAS Block Ranking: Data from *CAS Journal Block Ranking Report (2019.12.26)*, the best journal performance in all subcategories is tagged. We use B1 (red), B2 (yellow), B3 (green), B4 (grey) with different color to display different CAS block ranking. NA stands for not recorded in the report.

    <img src="/md_image/image-20200621181012739.png" alt="image-20200621181012739" width=20% />

   - The difference between JCR Quartile Ranking and CAS Block Ranking is well documented in 

     https://zhuanlan.zhihu.com/p/78144183

3. Display impact factor:  Data from 2019 *Journal Citation Reports*. NA stands for not recorded in the report.

4. Link to the Sci-Hub website with the corresponding article. If the article's doi is not found, the link will be disabled.
<p align="center">
   <img src="/md_image/image-20200622185138582.png" alt="image-20200622185138582" width=70% />
</p>
5. Display a full-screen PDF website without sidebar.  Analyzing the Sci-Hub link takes some time. If a full-text PDF link is found, it will be enabled and display 'PDF(Full Text)', otherwise, it will be grayed and display 'PDF(NOT FOUND)'.
<p align="center">
      <img src="/md_image/image-20200622073622374.png" alt="image-20200622073622374" width=70% />
</p>
6. Show article's information in BibTex format. You can save it or copy it to clipboard. It may take some time to fetch the Bibtex data from NCBI database. The filename of the downloaded file and the BibTex entry name is a combination of 'PMID', article PMID number, first author's last name and the publication year, like 'PMID32109013_Guan_2020'.
<p align="center">
      <img src="/md_image/image-20200622073913101.png" alt="image-20200622073913101" width=70% />
</p>
- **Popup Page**
<p align="center">
     <img src="/md_image/image-20200622120039682.png" alt="image-20200622120039682" width=40% />
</p>
Left click on the EP (EasyPubMed) chrome extension button, a popup page will appear.

1. Set default Sci-Hub URL, the default is 'https://sci-hub.tw/'. A valid Sci-Hub URL should start with 'https://' or 'http://' and end with "/".
2. Set whether to display  JCR  quartile or CAS  block. If one is enabled, the other one will be disabled automatically. The default setting is to display JCR quartile.
3. Reset to default setting: Sci-Hub URL 'https://sci-hub.tw/ and display JCR  quartile.
4. Link to PubMed website: https://pubmed.ncbi.nlm.nih.gov/
5. Link to Sci-Hub website as you set: default is 'https://sci-hub.tw/
6. Search the Sci-Hub website. You can input PMID, DOI,article title or any string you want, the same as you input in the Sci-Hub website.
7. Link to EasyPubMed User manual
8. Link to a website where you can report bugs or requests to EasyPubMed
9. Link to a website where you can donate to EasyPubMed
10. Link to a website where you can learn more about EasyPubMed developing story and author
11. EasyPubMed edition and author

## Data Source

We merge the data from NLM catalog, 2019 Journal Citation Reports and CAS Journal Block Ranking Report (2019.12.26) by journal's unqiue ISSN. The result has been carefully checked. Since JCR reports and CAS report may misuse eISSN as ISSN, there may be some mistakes in data processing. If you find a mistake, please report to me.

We use the journal's PubMed journal abbreviation as a unique identifier to obtain its impact factor, JCR quartile ranking and CAS block ranking. The following journals share the same Pubmed journal Abbreviation (I have reported the bug to NLM). Please be careful.

- PubMed journal abbreviation: Front Phys

   - Frontiers of Physics (ISSN:2095-0462; IF:2.483; Q2; B2) 

   - Frontiers in Physics (ISSN: 2296-424X; IF:1.895; Q2; B3) 
- PubMed journal abbreviation: Microbiology 
   - Microbiology (Reading, England) (ISSN: 1350-0872; IF:1.922; Q4; B4)
   - Microbiology (ISSN: 0026-2617; IF:1.027; Q4; B4)

## Disclaimer

The EasyPubMed extension and its developer take no responsibility for the data accuracy (including  JCR impact factor, JCR journal's quartile ranking, CAS journal's block ranking, article's information in BibTex format) and the origin of full-text article from Sci-Hub website. If you want to get the JCR impact factor or JCR journal's quartile, you should go to the JCR official website: https://jcr.clarivate.com/. If you want to get the CAS Journal Block Ranking, you should go to the following website: http://www.fenqubiao.com/.

## Bug report and suggestion

We are working on more exciting functions, please let us know if you have any comments and suggestions. If you find some data inaccurate, please let us know. Please feel free to contact easypubmed.project@gmail.com at any time or start a new issue in https://github.com/naivenaive/EasyPubMed/issues. 

## Donation

The EasyPubMed extension is completely free despite it takes us a lot of time to develop the extension. If you find it useful,  will you consider supporting us a cup of coffee($5), a box of snacks($10) or a good lunch($20)? We will feel great encouraged and energetic.

## Developing story

I am a medical student and used pubmed very often. Several years ago, I found a chrome extension named Pubmedy. It helped me a lot and saved me a lot of time to find the full-text of an article. The extension is really great but it had not updated since 2018. In May 2020, the new pubmed website completely replaced the old one and Pubmedy couldn't work anymore. I found it hard to get the full text when using the new pubmed. Furthermore, I used the bibliography in BibTex a lot, however, the pubmed website did not support. So, I decided to make a new chrome extension for the new pubmed website. Though I have learnt some R and Python programming skills, as a medical student, I knew little about how to develop a chrome extension. I used the code of pubmedy as a template and learnt to write an extension using JavaScript, CSS and HTML by myself. After overcoming many obstacles, I finished this project. Hope you find it useful. If you have any suggestions, please feel free to contact me easypubmed.project@gmail.com.

## Author
<left><img src="/md_image/image-20200622192159106.png" alt="image-20200622192159106"  width=20% />

##### Tian Zhen

##### Education:

- 2010-2015, Shanghai Jiao Tong University, School of Medicine. Bachelor degree of medicine

- 2015-2018, Shanghai *Medical College* of *Fudan* University, Master degree of dermatology.  Residency training in Huashan Hospital, department of dermatology. 

- 2018-now, Freelance, wait for chance and a miracle. God bless me.

##### Interest: 

- Have a chat about the meaning of life
- Dermatology (Psoriasis, Acne...), cosmetic dermatology (Laser, Botox...)
- Popularization of science
- Medical statistics, bioinformatics, handle medical data using R or Python
- Chrome extension develop using JavaScript, CSS and HTML 

If you have the same interest, need help in my interest field or have some temporary project like translating  medical material to Chinese, please feel free to contact me.

##### Contact:

- Email: tianzhenwork@outlook.com
- Zhihu: https://www.zhihu.com/people/naivenaive
