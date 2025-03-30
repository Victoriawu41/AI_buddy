from langchain_together import ChatTogether
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from course_model import HIGH_LEVEL_FIELDS
from langchain_core.rate_limiters import InMemoryRateLimiter
from course_info import save_course_models

rate_limiter = InMemoryRateLimiter(
    requests_per_second=0.1,  # request once every 10 seconds (limit for togetherai free llama model)
    check_every_n_seconds=0.1,  # Wake up every 100 ms to check whether allowed to make a request,
    max_bucket_size=10,  # Controls the maximum burst size.
)

llm = ChatTogether(
    # model="meta-llama/Llama-3-70b-chat-hf",
    model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    temperature=0,
    max_tokens=1000,
    timeout=None,
    max_retries=2,
    rate_limiter=rate_limiter,
)

prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "human",
            "You are an expert course-data scraping algorithm. "
            "Only extract relevant information from the text. "
            "Only return information present in the text. "
            "If you do not know or are unsure of the value of an attribute asked to extract, "
            "return null for the attribute's value."
            "Here is the course syllabus in markdown format: "
            "{course_syllabus}"
            "Here is some miscellaneous information about the course website: "
            "{misc_info}"
            "Here is the contents of the course website in markdown format: "
            "{course_website}",
        )
    ]
)

def query_llm(misc_info, course_website, course_syllabus):
    """Query the LLM for course information."""    
    prompt = prompt_template.invoke({"misc_info": misc_info, "course_website": course_website, "course_syllabus": course_syllabus})

    general_course_info = {}

    for field in HIGH_LEVEL_FIELDS:
        structured_llm = llm.with_structured_output(schema=field)
        info = structured_llm.invoke(prompt)
        general_course_info[field.__name__] = info
        print(field.__name__)

    print(save_course_models(general_course_info))