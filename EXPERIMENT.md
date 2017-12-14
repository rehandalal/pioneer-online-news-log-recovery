### Reduce Log Submission Interval

**Basic description of experiment:**

Increases the frequency at which Pioneer Online News Study logs are submitted.

**What are the preferences we will be changing?**

- extensions.pioneer-online-news.logSubmissionInterval
- extensions.pioneer-online-news.logUploadAttemptInterval

**What are the branches of the study and what values should each branch be set to?**

- All:
  extensions.pioneer-online-news.logSubmissionInterval: 3600000
  extensions.pioneer-online-news.logUploadAttemptInterval: 900000

**What percentage of users do you want in each branch?**

100% of users with the pioneer online news study addon.

**What Channels and locales do you intend to ship to?**

all channels and all locales

**What is your intended go live date and how long will the study run?**

Start Date: December 14th 2017
End Date: January 23rd 2018

**Are there specific criteria for participants?**

Users must have the pioneer online news study addon installed.

**What is the main effect you are looking for and what data will you use to make these decisions?**

The main effect we are looking for is to try and have more consistent streams of log data from users.

We will look at the pioneer log decryptions and measure the unique pioneer ID's for those pings vs the main ping to ensure that we have reasonable overlap.

**Who is the owner of the data analysis for this study?**

Sunah Suh (sunahsuh)

**Will this experiment require uplift?**

No

**QA Status of your code:**

No new code is being shipped. The addon that has alrerady been shipped has been tested and signed off on by QA.

**Do you plan on surveying users at the end of the study?**

Yes.
